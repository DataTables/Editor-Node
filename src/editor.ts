
import * as crc from 'crc';
import Field, {SetType} from './field';
import knex from 'knex';
import NestedData from './nestedData';
import Format from './formatters';
import Validate from './validators';

export enum Action {
    Read,
    Create,
    Edit,
    Delete,
    Upload
};

export interface DtError {
    name: string;
    status: string;
}

export interface DtResponse {
    data?: object[];
    sqlDebug?: object[];
    cancelled?: string[];
    error?: string;
    fieldErrors?: DtError[];
    options?: object;
    files?: object;
    draw?: number;
    recordsTotal?: number;
    recordsFiltered?: number;
}

export interface DtRequest {
    action?: string;
    data?: object[];
    draw?: number;
    start?: number;
    length?: number;
    order?: {
        dir: 'asc'|'desc',
        column: number
    }[];
    columns?: {
        data: string;
        searchable: boolean;
        search: {
            value: string;
        }
    }[];
    search?: {
        value: string;
    }
}

export interface IGlobalValidator {
    ( editor: Editor, action: string, http: DtRequest ): Promise<true|string>
}

interface SSP {
    draw?: number;
    recordsFiltered?: number;
    recordsTotal?: number;
}

interface LeftJoin {
    table: string;
    field1: string;
    field2: string;
    operator: string;
}


export default class Editor extends NestedData {
    public static version: string = '1.7.0';

    public static action ( http ): Action {
        if ( ! http || ! http.action ) {
            return Action.Read;
        }

        switch ( http.action ) {
            case 'create':
                return Action.Create;
            
            case 'edit':
                return Action.Edit;
            
            case 'remove':
                return Action.Delete;
            
            case 'upload':
                return Action.Upload;
            
            default:
                throw new Error( 'Unknown Editor action: '+http.action );
        }
    }



    private _db: knex;
    private _fields: Field[] = [];
    private _formData;
    private _processData;
    private _idPrefix: string = 'row_';
    private _join = [];
    private _pkey: string[] = ['id'];
    private _table: string[] = [];
    private _transaction: boolean = false;
    private _where = [];
    private _leftJoin: LeftJoin[] = [];
    private _out: DtResponse = {};
    private _events = [];
    private _debug: boolean = false;
    private _validator: IGlobalValidator;
    private _tryCatch: boolean = false;
    private _knexTransaction: knex;


    constructor( db: knex=null, table:string|string[]=null, pkey: string|string[]=null ) {
        super();
        
        this.db( db );
        this.table( table );
        this.pkey( pkey );
    }

    public data (): DtResponse {
        return this._out;
    }

    public db (): knex;
    public db (db: knex): Editor;
    public db (db?: knex): any {
        if ( db === undefined ) {
            return this._knexTransaction ?
                this._knexTransaction :
                this._db;
        }

        this._db = db;
        return this;
    }

    public debug (): boolean;
    public debug (debug: boolean): Editor;
    public debug (debug?: boolean): any {
        if ( debug === undefined ) {
            return this._debug;
        }

        this._debug = debug;
        return this;
    }


    public field ( nameOrField: Field|string ) {
        if ( typeof nameOrField === 'string' ) {
            for ( let i=0, ien=this._fields.length ; i<ien ; i++ ) {
                if ( this._fields[i].name() === nameOrField ) {
                    return this._fields[i];
                }
            }

            throw new Error( 'Unknown field: '+nameOrField );
        }

        this._fields.push( nameOrField );
        return this;
    }


    public fields (): Field[];
    public fields (...fields: Field[]): Editor;
    public fields (...fields: Field[]): any {
        if ( fields === undefined || fields.length === 0 ) {
            return this._fields;
        }

        this._fields.push.apply( this._fields, fields );
        
        return this;
    }

    public idPrefix (): string;
    public idPrefix (idPrefix: string): Editor;
    public idPrefix (idPrefix?: string): any {
        if ( idPrefix === undefined ) {
            return this._idPrefix;
        }

        this._idPrefix = idPrefix;
        return this;
    }

    public inData (): DtRequest {
        return this._processData;
    }

    // TODO join

    public leftJoin( table: string, field1: string, operator: string, field2: string ): Editor {
        this._leftJoin.push( {
            table,
            field1,
            field2,
            operator
        } );

        return this;
    }

    public on ( name: string, callback: Function ): Editor {
        if ( ! this._events[ name ] ) {
            this._events[ name ] = [];
        }

        this._events[ name ].push( callback );

        return this;
    }

    public table (): string[];
    public table (table: string|string[]): Editor;
    public table (table?: string|string[]): any {
        if ( table === undefined || table.length === 0 ) {
            return this._table;
        }

        if ( typeof table === 'string' ) {
            this._table.push( table );
        }
        else {
            this._table.push.apply( this._table, table );
        }
        
        return this;
    }

    public transaction (): boolean;
    public transaction (transaction: boolean): Editor;
    public transaction (transaction?: boolean): any {
        if ( transaction === undefined ) {
            return this._transaction;
        }

        this._transaction = transaction;
        return this;
    }

    public pkey (): string[];
    public pkey (pkey: string|string[]): Editor;
    public pkey (pkey?: string|string[]): any {
        if ( pkey === undefined ) {
            return this._pkey;
        }

        if ( typeof pkey === 'string' ) {

            this._pkey = [ pkey ];
        }
        else {
            this._pkey = pkey;
        }
        
        return this;
    }

    public pkeyToValue( row: object, flat: boolean=false ): string {
        let pkey = this.pkey();
        let id = [];
        let val;

        for ( let i=0, ien=pkey.length ; i<ien ; i++ ) {
            let column = pkey[i];

            if ( flat ) {
                val = row[ column ] ?
                 row[ column ] :
                 null; 
            }
            else {
                val = this._readProp( column, row );
            }

            if ( val === null ) {
                throw new Error( 'Primary key element is not available in the data set' );
            }

            id.push( val );
        }

        return id.join( this._pkeySeparator() );
    }

    public pkeyToObject ( value: string, flat: boolean=false, pkey: string[]=null): object {
        let arr: object = {};
        
        value = value.replace( this.idPrefix(), '' );
        let idParts = value.split( this._pkeySeparator() );

        if ( pkey === null ) {
            pkey = this.pkey();
        }

        if ( pkey.length !== idParts.length ) {
            throw new Error( 'Primary key data doesn\'t match submitted data' );
        }

        for ( let i=0, ien=idParts.length ; i<ien ; i++ ) {
            if ( flat ) {
                arr[ pkey[i] ] = idParts[i];
            }
            else {
                this._writeProp( arr, pkey[i], idParts[i] );
            }
        }
    
        return arr;
    }


    public async process ( data: object ): Promise<Editor> {
        if ( this._debug ) {
            // TODO
        }
        let that = this;
        let run = async function () {
            if ( that._tryCatch ) {
                try {
                    await that._process( data );
                }
                catch ( e ) {
                    that._out.error = e.message;

                    if ( that._transaction ) {
                        // TODO Does knex do the rollback automatically for us?
                    }
                }
            }
            else {
                await that._process( data );
            }

        }

        if ( this._transaction ) {
            await this._db.transaction( async function(trx) {
                that._knexTransaction = trx;
                await run();
                that._knexTransaction = null;
            } )
        }
        else {
            await run();
        }

        if ( this._debug ) {
            // TODO
        }

        return this;
    }

    public tryCatch (): boolean;
    public tryCatch (tryCatch: boolean): Editor;
    public tryCatch (tryCatch?: boolean): any {
        if ( tryCatch === undefined ) {
            return this._tryCatch;
        }

        this._tryCatch = tryCatch;
        return this;
    }

    public async validate( errors: DtError[], http: DtRequest ): Promise<boolean> {
        if ( http.action !== 'create' && http.action !== 'edit' ) {
            return true;
        }

        let keys = Object.keys( http.data );
        let fields = this.fields();
        let idPrefix = this.idPrefix();

        for ( let i=0, ien=keys.length ; i<ien ; i++ ) {
            for ( let j=0, jen=fields.length ; j<jen ; j++ ) {
                let field = fields[j];
                let values = http.data[ keys[i] ];
                let validation = await field.validate( values, this, keys[i].replace( idPrefix, '' ) );

                if ( validation !== true ) {
                    errors.push( {
                        name: field.name(),
                        status: validation
                    } );
                }
            }

            // TODO MJoin validation
        }

        return errors.length > 0 ?
            false :
            true;
    }

    public validator (): IGlobalValidator;
    public validator (fn: IGlobalValidator): Editor;
    public validator (fn?: IGlobalValidator): any {
        if ( fn === undefined ) {
            return this._validator;
        }

        this._validator = fn;
        return this;
    }

    public where (): any[];
    public where (cond: any): Editor;
    public where (cond?: any): any {
        if ( cond === undefined ) {
            return this._where;
        }

        this._where.push( cond );
        
        return this;
    }



    private async _process ( data: DtRequest ): Promise<void> {
        this._out = {
            data: [],
            fieldErrors: []
        };

        this._processData = data;
        this._formData = data.data ? data.data: null;
        this._prepJoin();

        if ( this._validator ) {
            let ret = await this._validator( this, data.action, data );

            if ( ret !== true ) {
                this._out.error = ret;
            }
        }

        if ( ! this._out.error ) {
            if ( ! data.action ) {
                let outData = await this._get( null, data );

                this._out.data = outData.data;
                this._out.draw = outData.draw;
                this._out.options = outData.options;
                this._out.recordsTotal = outData.recordsTotal;
                this._out.recordsFiltered = outData.recordsFiltered;
            }
            else if ( data.action === 'upload' ) {
                // TODO
            }
            else if ( data.action === 'remove' ) {
                await this._remove( data );
            }
            else {
                // create or edit
                let keys = Object.keys( data.data );

                // Pre events so they can occur before validation, and they
                // all happen together
                for ( let i=0, ien=keys.length ; i<ien ; i++ ) {
                    let cancel = null;
                    let idSrc = keys[i];
                    let values = data.data[keys[i]];

                    if ( data.action === 'create' ) {
                        cancel = this._trigger( 'preCreate', values );
                    }
                    else {
                        let id = idSrc.replace( this.idPrefix(), '' );
                        cancel = this._trigger( 'preEdit', id, values );
                    }
                
                    // One of the event handlers returned false - don't continue
                    if ( cancel === false ) {
                        // Remove the data from the data set so it won't be processed
                        delete data.data[ idSrc ];

                        // Tell the client-side we aren't updating this row
                        this._out.cancelled.push( idSrc );
                    }
                }

                // Field validation
                let valid = await this.validate( this._out.fieldErrors, data );

                if ( valid ) {
                    keys = Object.keys( data.data );

                    for ( let i=0, ien=keys.length ; i<ien ; i++ ) {
                        let d = data.action === 'create' ?
                            await this._insert( data.data[keys[i]] ) :
                            await this._update( keys[i], data.data[keys[i]] );

                        if ( d !== null ) {
                            this._out.data.push( d );
                        }
                    }
                }

                // TODO fileClean
            }
        }
    }

    private async _get ( id: string, http: object=null ): Promise<DtResponse> {
        let cancel = this._trigger( 'preGet', id );
        if ( cancel === false ) {
            return {};
        }

        let fields = this.fields();
        let pkeys = this.pkey();
        let query = this.db()( this.table() );
        let options = {};

        for ( let i=0, ien=pkeys.length ; i<ien ; i++ ) {
            query.select( pkeys[i] +' as '+ pkeys[i] );
        }

        for ( let i=0, ien=fields.length ; i<ien ; i++ ) {
            if ( pkeys.includes( fields[i].dbField() ) ) {
                continue;
            }

            if( fields[i].apply('get') && fields[i].getValue() === undefined ) {
                // Use the `as` to ensure that the table name is included, if using a join
                query.select( fields[i].dbField() +' as '+ fields[i].dbField() );
            }
        }

        this._getWhere( query );
        this._performLeftJoin( query );
        let ssp = await this._ssp( query, http );

        if ( id !== null ) {
            query.where( this.pkeyToObject( id, true ) );
        }

        let result = await query;
        if ( ! result ) {
            throw new Error( 'Error executing SQL for data get. Enable SQL debug using `->debug(true)`' );
        }

        let out = [];
        for ( let i=0, ien=result.length ; i<ien ; i++ ) {
            let inner = {
                'DT_RowId': this.idPrefix() + this.pkeyToValue( result[i], true )
            };

            for ( let j=0, jen=fields.length ; j<jen ; j++ ) {
                if ( fields[j].apply('get') ) {
                    fields[j].write( inner, result[i] );
                }
            }

            out.push( inner );
        }

        // Field options
        if ( id === null ) {
            for ( let i=0, ien=fields.length ; i<ien ; i++ ) {
                let opts = await fields[i].optionsExec( this._db );

                if ( opts ) {
                    options[ fields[i].name() ] = opts;
                }
            }
        }

        // TODO Row based joins

        this._trigger( 'postGet', id, out );

        return {
            data: out,
            draw: ssp.draw,
            options,
            recordsFiltered: ssp.recordsFiltered,
            recordsTotal: ssp.recordsTotal
        }
    }

    private async _ssp ( query: knex.query, http: DtRequest ): Promise<SSP> {
        if ( ! http || ! http.draw ) {
            return {};
        }

        // Add the server-side processing conditions to the get query
        this._sspLimit( query, http );
        this._sspSort( query, http );
        this._sspFilter( query, http );

        // Get the number of rows in the result set
        let setCount = this
            ._db( this.table() )
            .count( this._pkey[0] +' as cnt' );
        
        this._getWhere( setCount );
        this._sspFilter( setCount, http );
        this._performLeftJoin( setCount );

        let res = await setCount;
        let recordsFiltered = res[0].cnt;

        // Get the number of rows in the full set
        let fullCount = this
            ._db( this.table() )
            .count( this._pkey[0] +' as cnt' );

        this._getWhere( fullCount );
        if ( this._where.length  ) { // only needed if there is a where condition
            this._performLeftJoin( fullCount );
        }
        res = await fullCount;
        let recordsTotal = res[0].cnt;

        return {
            draw: http.draw*1,
            recordsFiltered,
            recordsTotal
        };
    }

    private _sspFilter( query: knex.query, http: DtRequest ): void {
        let fields = this.fields();

        // GLobal filter
        if ( http.search.value ) {
            query.where( (q) => {
                for ( let i=0, ien=http.columns.length ; i<ien ; i++ ) {
                    if ( http.columns[i].searchable ) {
                        let field = this._sspField( http, i );

                        if ( field ) {
                            q.orWhere( field, 'LIKE', '%'+http.search.value+'%' );
                        }
                    }
                }
            } );
        }

        // Column filter
        for ( let i=0, ien=http.columns.length ; i<ien ; i++ ) {
            let column = http.columns[i];
            let search = column.search.value;

            if ( search !== '' && column.searchable ) {
                query.where(
                    this._sspField( http, i ),
                    'LIKE',
                    '%'+search+'%'
                )
            }
        }
    }

    private _sspLimit( query: knex.query, http: DtRequest ): void {
        if ( http.length != -1 ) { // -1 is 'show all' in DataTables
            query
                .limit( http.length*1 )
                .offset( http.start*1 );
        }
    }

    private _sspSort( query: knex.query, http: DtRequest ): void {
        for ( let i=0, ien=http.order.length ; i<ien ; i++ ) {
            let order = http.order[i];

            query.orderBy(
                this._sspField( http, order.column ),
                order.dir === 'asc' ? 'asc' : 'desc'
            )
        }
    }

    private _sspField( http: DtRequest, index: number ): string {
        let name = http.columns[ index ].data;
        let field = this._findField( name, 'name' );

        if ( ! field ) {
            // Is it the primary key?
            if ( name === 'DT_RowId' ) {
                return this._pkey[0];
            }

            throw new Error( 'Unknown field: '+name+' (index '+index+')' );
        }

        return field.dbField();
    }

    private _prepJoin(): void {
        if ( this._leftJoin.length === 0 ) {
            return;
        }

        // Check if hte primary key has a table identifier - if not - add one
        for ( let i=0, ien=this._pkey.length ; i<ien ; i++ ) {
            let val = this._pkey[i];

            if ( val.indexOf('.') === -1 ) {
                this._pkey[i] = this._alias( this.table()[0], 'alias' )+'.'+val;
            }
        }

		// Check that all fields have a table selector, otherwise, we'd need to
		// know the structure of the tables, to know which fields belong in
		// which. This extra requirement on the fields removes that
        for ( let i=0, ien=this._fields.length ; i<ien ; i++ ) {
            let field = this._fields[i];
            let name = field.dbField();

            if ( name.indexOf('.') === -1 ) {
				throw new Error( 'Table part of the field "'+name+'" was not found. '+
					'In Editor instances that use a join, all fields must have the '+
					'database table set explicitly.'
				);
            }
        }
    }

    private _performLeftJoin( query: knex ): void {
        for ( let i=0, ien=this._leftJoin.length ; i<ien ; i++ ) {
            let join = this._leftJoin[i];

            query.leftJoin( join.table, function () {
                this.on( join.field1, join.operator, join.field2 );
            } );
        }
    }


    private async _insert( values: object ): Promise<object> {
		// Only allow a composite insert if the values for the key are
		// submitted. This is required because there is no reliable way in MySQL
		// to return the newly inserted row, so we can't know any newly
		// generated values.
		this._pkeyValidateInsert( values );

		// Insert the new row
		let id = await this._insertOrUpdate( null, values );

		// Was the primary key altered as part of the edit, if so use the
		// submitted values
        id = this._pkey.length > 1 ?
            this.pkeyToValue( values ) :
            this._pkeySubmitMerge( id, values );

        // TODO Join

		this._trigger( 'writeCreate', id, values );

        let row = await this._get( id );
        row = row.data.length > 0 ?
            row.data[0] :
            null;

		this._trigger( 'postCreate', id, values, row );

        return row;
    }

    private async _update( id:string, values: object ): Promise<object> {
        id = id.replace( this.idPrefix(), '' );

        // Update or insert the rows for the parent table and the left joined
        // tables
        await this._insertOrUpdate( id, values );

        // TODO join

		// Was the primary key altered as part of the edit, if so use the
		// submitted values
        let getId = this._pkeySubmitMerge( id, values );

		this._trigger( 'writeEdit', id, values );

        let row = await this._get( getId );
        row = row.data.length > 0 ?
            row.data[0] :
            null;
        
		this._trigger( 'postEdit', id, values, row );

        return row;
    }

    private _pkeySubmitMerge ( pkeyVal: string, row: object ): string {
        let pkey = this._pkey;
        let arr = this.pkeyToObject( pkeyVal, true );

        for ( let i=0, ien=pkey.length ; i<ien ; i++ ) {
            let column = pkey[ i ];
            let field = this._findField( column, 'db' );

            if ( field && field.apply( 'edit', row ) ) {
                arr[ column ] = field.val( 'set', row );
            }
        }

        return this.pkeyToValue( arr, true );
    }


    private async _remove( http:DtRequest ): Promise<void> {
        let ids: string[] = [];
        let keys = Object.keys( http.data );

        for ( let i=0, ien=keys.length ; i<ien ; i++ ) {
            // Strip the ID prefix that the client-side sends back
            let id = keys[i].replace( this.idPrefix(), '' );

            let res = this._trigger( 'preRemove', id, http.data[keys[i]] );

            // Allow the event to be cancelled and inform the client-side
            if ( res === false ) {
                this._out.cancelled.push( id );
            }
            else {
                ids.push( id );
            }
        }

        if ( ids.length === 0 ) {
            return;
        }

        // Row based joins - remove first as the host row will be removed which
        // is a dependency
        // TODO joins

        // Remove from the left join tables
        for ( let i=0, ien=this._leftJoin.length ; i<ien ; i++ ) {
            let join = this._leftJoin[i];
            let table = this._alias( join.table, 'orig' );
            let parentLink, childLink;

            // Which side of the join refers to the parent table?
            if ( join.field1.indexOf( join.table ) === 0 ) {
                parentLink = join.field2;
                childLink = join.field1;
            }
            else {
                parentLink = join.field1;
                childLink = join.field2;
            }

			// Only delete on the primary key, since that is what the ids refer
			// to - otherwise we'd be deleting random data! Note that this
			// won't work with compound keys since the parent link would be
			// over multiple fields.
            if ( parentLink === this._pkey[0] && this._pkey.length === 1 ) {
                this._removeTable( join.table, ids, [childLink] );
            }
        }

        // Remove from the primary tables
        let tables = this.table();

        for ( let i=0, ien=tables.length ; i<ien ; i++ ) {
            await this._removeTable( tables[i], ids );
        }

        for ( let i=0, ien=keys.length ; i<ien ; i++ ) {
            await this._trigger( 'postRemove', keys[i], http.data[ keys[i] ] );
        }
    }

    private async _removeTable( table: string, ids: string[], pkey: string[]=null ): Promise<void> {
        if ( pkey === null ) {
            pkey = this.pkey();
        }

        // Check that there is actually a field which has a set option for this table
        let count = 0;
        let fields = this.fields();

        for ( let i=0, ien=fields.length ; i<ien ; i++ ) {
            let dbField = fields[i].dbField();

            if ( dbField.indexOf('.') === -1 ||
                (this._part( dbField, 'table') === table && fields[i].set() !== SetType.None)
            ) {
                count++;
            }
        }

        if ( count > 0 ) {
            let q = this._db( table );

            for ( let i=0, ien=ids.length ; i<ien ; i++ ) {
                let cond = this.pkeyToObject( ids[i], true, pkey );

                q.orWhere( function() {
                    this.where( cond );
                } );
            }

            await q.del();
        }
    }


    private async _insertOrUpdate ( id: string, values: object ): Promise<string> {
        // Loop over the tables, doing the insert or update as needed
        let tables = this.table();

        for ( let i=0, ien=tables.length ; i<ien ; i++ ) {
            let res = await this._insertOrUpdateTable(
                tables[i],
                values,
                id !== null ?
                    this.pkeyToObject( id, true ) :
                    null
            );

            // If you don't have an id yet, then the first insert will return
            // the id we want
            if ( id === null ) {
                id = res;
            }
        }

        // And for the left join tables
        for ( let i=0, ien=this._leftJoin.length ; i<ien ; i++ ) {
            let join = this._leftJoin[i];

            // Which side of the join refers to the parent table?
            let joinTable = this._alias( join.table, 'alias' );
            let tablePart = this._part( join.field1 );
            let parentLink, childLink, whereVal;

            if ( this._part( join.field1, 'db' ) ) {
                tablePart = this._part( join.field1, 'db' )+'.'+tablePart;
            }

            if ( tablePart === joinTable ) {
                parentLink = join.field2;
                childLink = join.field1;                
            }
            else {
                parentLink = join.field1;
                childLink = join.field2;
            }

            if ( parentLink === this._pkey[0] && this._pkey.length === 1 ) {
                whereVal = id;
            }
            else {
				// We need submitted information about the joined data to be
				// submitted as well as the new value. We first check if the
				// host field was submitted
                let field = this._findField( parentLink, 'db' );

                if ( ! field || ! field.apply( 'edit', values ) ) { // TODO this isn't right could be create
                    // If not, then check if the child id was submitted
                    field = this._findField( childLink, 'db' );
                    
                    if ( ! field || ! field.apply( 'edit', values ) ) {
                        // No data available, so we can't do anything
                        continue;
                    }
                }

                whereVal = field.val( 'set', values );
            }

            let whereName = this._part( childLink, 'column' );

            this._insertOrUpdateTable(
                join.table,
                values,
                { [whereName]: whereVal }
            );
        }

        return id;
    }

    private async _insertOrUpdateTable( table: string, values: object, where: object=null ) {
        let set = {}, res;
        let action: 'create'|'edit' = (where === null) ? 'create' : 'edit';
        let tableAlias = this._alias( table, 'alias' );
        let fields = this.fields();

        for ( let i=0, ien=fields.length ; i<ien ; i++ ) {
            let field = fields[i];
            let tablePart = this._part( field.dbField() );

            if ( this._part( field.dbField(), 'db' ) ) {
                tablePart = this._part( field.dbField(), 'db' )+'.'+tablePart;
            }

            // Does this field apply to the table (only check when a join is
            // being used)
            if ( this._leftJoin.length && tablePart !== tableAlias ) {
                continue;
            }

            // Check if this field should be set, based on options and
            // submitted data
            if ( ! field.apply( action, values ) ) {
                continue;
            }

            // Some db's (specifically postgres) don't like having the table
            // name prefixing the column name.
            let fieldPart = this._part( field.dbField(), 'column' );
            set[ fieldPart ] = field.val( 'set', values );
        }

        if ( Object.keys(set).length === 0 ) {
            return null;
        }

        if ( action === 'create' ) {
            res = await this
                ._db( table )
                .insert( set )
                .returning( this._pkey );
            
            return res[0].toString(); // TODO test with compound key
        }
        else {
            await this
                ._db( table )
                .update( set )
                .where( where );
        }
    }

    private _getWhere( query: knex ): void {
        let where = this.where();

        for ( let i=0, ien=where.length ; i<ien ; i++ ) {
            query.where( where[i] );
        }
    }

    private _trigger( name: string, ...args ): boolean {
        let out = null;
        let events = this._events[ name ];

        if ( ! this._events[ name ] ) {
            return;
        }

        for ( let i=0, ien=events.length ; i<ien ; i++ ) {
            let res = events[i].apply( this, args );

            if ( res !== null ) {
                out = res;
            }
        }

        return out;
    }


    private _part( name:string, type: 'table'|'db'|'column'='table'): string {
        let db, table, column;

        if ( name.indexOf('.') !== -1 ) {
            let a = name.split('.');

            if ( a.length === 3 ) {
                db = a[0];
                table = a[1];
                column = a[2];
            }
            else if ( a.length === 2 ) {
                table = a[0];
                column = a[1];
            }
        }
        else {
            column = name;
        }

        if ( type === 'db' ) {
            return db;
        }
        else if ( type === 'table' ) {
            return table;
        }
        return column;
    }

    private _alias( name: string, type: 'alias'|'orig'='alias'): string {
        if ( name.indexOf( ' as ' ) !== -1 ) {
            let a = name.split(/ as /i);
            return type === 'alias' ?
                a[1] :
                a[0];
        }

        return name;
    }



    private _findField ( name: string, type: 'db'|'name' ): Field {
        let fields = this._fields;

        for ( let i=0, ien=fields.length ; i<ien ; i++ ) {
            let field = fields[i];

            if ( type === 'name' && field.name() === name ) {
                return field;
            }
            else if ( type === 'db' && field.dbField() === name ) {
                return field;
            }
        }

        return null;
    }


    private _pkeyValidateInsert( row: object ): boolean {
        let pkey = this.pkey();

        if ( pkey.length === 1 ) {
            return true;
        }

        for ( let i=0, ien=pkey.length ; i<ien ; i++ ) {
            let column = pkey[i];
            let field = this._findField( column, 'db' );

            if ( ! field || ! field.apply('create', row) ) {
                throw new Error( 'When inserting into a compound key table, '+
                    'all fields that are part of the compound key must be '+
                    'submitted with a specific value.'
                );
            }
        }

        return true;
    }

    private _pkeySeparator (): string {
        let str = this.pkey().join(',');

        return crc.crc32( str ).toString(16);
    }
}
