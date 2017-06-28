
import * as crc32 from 'buffer-crc32';
import Field from './field';
import knex from 'knex';
import NestedData from './nestedData';

enum Action {
    Read,
    Create,
    Edit,
    Delete,
    Upload
};


export interface DtResponse {

}



export default class Editor extends NestedData {
    public static Action = Action;

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
    private _leftJoin = [];
    private _out: DtResponse = {};
    private _events = [];
    private _debug: boolean = false;
    private _validator;
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

    public inData () { // TODO typing
        return this._processData;
    }

    // TODO join

    // TODO leftJoin

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
            this._pkey.push( pkey );
        }
        else {
            this._pkey.push.apply( this._pkey, pkey );
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

    public pkeyToArray ( value: string, flat: boolean=false, pkey: string[]=null): string[] {
        let arr: string[] = [];
        
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

    // TODO validate

    // TODO validator

    // TODO where




    private async _process ( data: object ): Promise<void> {
        this._out = {};

        if ( ! data.action ) {
            let outData = await this._get( null, data );
            this._out.data = outData.data; // TODO a merge
        }
    }

    private async _get ( id: string, data: object ): Promise<object> {
        let fields = this.fields();
        let pkeys = this.pkey();
        let query = this
            .db()( this.table() )
            .select( pkeys );

        for ( let i=0, ien=fields.length ; i<ien ; i++ ) {
            if ( pkeys.includes( fields[i].dbField() ) ) {
                continue;
            }

            if( fields[i].apply('get') && fields[i].getValue() === undefined ) {
                query.select( fields[i].dbField() );
            }
        }

        // TODO where
        // TODO leftJoin
        // TODO SSP

        if ( id !== null ) {
            query.where( this.pkeyToArray( id, true ) );
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


        // TODO field options

        // TODO Row based joins

        // TODO postGet

        return {
            data: out
        }
    }


    private _pkeySeparator (): string {
        let str = this.pkey().join(',');

        return crc32( str );
    }
}
