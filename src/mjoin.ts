
import Editor, {DtResponse, DtRequest} from './editor';
import Field from './field';
import NestedData from './nestedData';
import * as knex from 'knex';

interface JoinTable {
    table?: string;
    parent: string|string[];
    child: string|string[];
}

export default class Mjoin extends NestedData {
    constructor( table: string ) {
        super();

        this.table( table );
        this.name( table );
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Private parameters
     */

    private _table: string;
    private _editor: Editor;
    private _name: string;
    private _get: boolean = true;
    private _set: boolean = true;
    private _where: any[] = [];
    private _fields: Field[] = [];
    private _links: string[] = [];
    private _order: string;
    private _join: JoinTable = {
        parent: '',
        child: ''
    };

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Public methods
     */
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
    public fields (...fields: Field[]): Mjoin;
    public fields (...fields: Field[]): any {
        if ( fields === undefined || fields.length === 0 ) {
            return this._fields;
        }

        this._fields.push.apply( this._fields, fields );
        
        return this;
    }

    public get (): boolean;
    public get (flag: boolean): Mjoin;
    public get (flag?: boolean): any {
        if ( flag === undefined ) {
            return this._get;
        }

        this._get = flag;
        return this;
    }

    public link( field1: string, field2: string ): Mjoin {
        if ( field1.indexOf('.') === -1 || field2.indexOf('.') === -1 ) {
            throw new Error( 'Mjoin fields must contain both the table name and the column name' );
        }

        if ( this._links.length === 4 ) {
            throw new Error( 'Mjoin link method cannot be called more than twice for a single instance' );
        }

        // Add to list - it is resolved later on
        this._links.push( field1 );
        this._links.push( field2 );

        return this;
    }

    public name (): string;
    public name (name: string): Mjoin;
    public name (name?: string): any {
        if ( name === undefined ) {
            return this._name;
        }

        this._name = name;
        return this;
    }

    public order (): string;
    public order (order: string): Mjoin;
    public order (order?: string): any {
        if ( order === undefined ) {
            return this._order;
        }

        this._order = order;
        return this;
    }

    public set (): boolean;
    public set (flag: boolean): Mjoin;
    public set (flag?: boolean): any {
        if ( flag === undefined ) {
            return this._set;
        }

        this._set = flag;
        return this;
    }

    public table (): string;
    public table (table: string): Mjoin;
    public table (table?: string): any {
        if ( table === undefined ) {
            return this._table;
        }

        this._table = table;
        return this;
    }

    public where (): any[];
    public where (cond: any): Mjoin;
    public where (cond?: any): any {
        if ( cond === undefined ) {
            return this._where;
        }

        this._where.push( cond );
        
        return this;
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Internal methods
     */
    public async data ( editor: Editor, response: DtResponse ): Promise<void> {
        if ( ! this._get ) {
            return;
        }

        this._prepare( editor );
        let fields = this.fields();
        let join = this._join;

        // This is something that will likely come in a future version, but it
        // is a relatively low use feature. Please get in touch if this is
        // something you require.
        if ( editor.pkey().length > 1 ) {
            throw new Error( 'Mjoin is not currently supported with a compound primary key for the main table' );
        }

        // If the Editor primary key is join key, then it is read automatically
        // and into Editor's primary key store
        let dteTable = editor.table()[0];
        let joinField = join.table ?
            join.parent[0] :
            join.parent;

        let pkeyIsJoin = joinField === editor.pkey()[0] ||
                         dteTable+'.'+joinField === editor.pkey()[0];
        
        // Build the basic query
        let query = editor.db()( dteTable )
            .distinct( dteTable+'.'+joinField + ' as dteditor_pkey' );
        
        let order = this.order();
        if ( order ) {
            let a = order.split( ' ' );

            if ( a.length > 1 ) {
                query.orderBy( a[0], a[1] );
            }
            else {
                query.orderBy( a );
            }
        }

        this._applyWhere( query );

        for ( let i=0, ien=fields.length ; i<ien ; i++ ) {
            let field = fields[i];

            if ( field.apply('get') && field.getValue() === undefined ) {
                let dbField = field.dbField();

                if ( dbField.indexOf('.') === -1 ) {
                    query.select( this._table +'.'+ dbField +' as '+ dbField );
                }
                else {
                    query.select( dbField );
                }
            }
        }

        // Create the joins
        if ( join.table ) {
            query.leftJoin( join.table, dteTable+'.'+join.parent[0], '=', join.table+'.'+join.parent[1] );
            query.leftJoin( this._table, this._table+'.'+join.child[0], '=', join.table+'.'+join.child[1] );
        }
        else {
            query.leftJoin( this._table, join.parent, '=', join.child );
        }

        let res = await query;

        if ( res.length ) {
            let readField = '';

            if ( this._propExists( dteTable+'.'+joinField, response.data[0] ) ) {
                readField = dteTable+'.'+joinField;
            }
            else if ( this._propExists( joinField.toString(), response.data[0] ) ) {
                readField = joinField.toString();
            }
            else if ( !pkeyIsJoin ) {
                throw new Error(
                    "Join was performed on the field '" + joinField + "' which was not " +
                    "included in the Editor field list. The join field must be " +
                    "included as a regular field in the Editor instance."
                );
            }

            // Map the data to the primary key for fast loop up
            let joinMap = {};

            for ( let i=0, ien=res.length ; i<ien ; i++ ) {
                let inner = {};

                for( let j=0, jen=fields.length ; j<jen ; j++ ) {
                    fields[j].write( inner, res[i] );
                }

                let lookup = res[i]['dteditor_pkey'];
                
                if ( ! joinMap[ lookup ] ) {
                    joinMap[ lookup ] = [];
                }

                joinMap[ lookup ].push( inner );
            }

            // Loop over the data in the original response and do a join based on
            // the mapped data
            for ( let i=0, ien=response.data.length ; i<ien ; i++ ) {
                let data = response.data[i];
                let linkField = pkeyIsJoin ?
                    data['DT_RowId'].replace( editor.idPrefix(), '' ) :
                    this._readProp( readField, data );
                
                if ( joinMap[ linkField ] ) {
                    data[ this._name ] = joinMap[ linkField ];
                }
                else {
                    data[ this._name ] = [];
                }
            }
        }

        // Field options
        for ( let i=0, ien=fields.length ; i<ien ; i++ ) {
            let opts = await fields[i].optionsExec( editor.db() );

            if ( opts ) {
                let name = this.name()+'[].'+fields[i].name();

                response.options[ name ] = opts;
            }
        }
    }


    public async create ( editor: Editor, parentId: string, data: object ): Promise<void> {
        // If not settable, or the many count for the join was not submitted
        // then we do nothing
        if (
            ! this._set ||
            ! data[ this._name ] ||
            ! data[ this._name+'-many-count']
        ) {
            return;
        }

        this._prepare( editor );
        let db = editor.db();

        for ( let i=0, ien=data[ this._name ].length ; i<ien ; i++ ) {
            await this._insert( db, parentId, data[ this._name ][i] );
        }
    }

    public async update ( editor: Editor, parentId: string, data: object ): Promise<void> {
        if ( ! this._set || ! data[ this._name+'-many-count'] ) {
            return;
        }

        // WARNING - this will remove rows and then readd them. Any
        // data not in the field list WILL BE LOST
        await this.remove( editor, [parentId] );
        await this.create( editor, parentId, data );
    }

    public async remove ( editor: Editor, ids: string[] ): Promise<void> {
        if ( ! this._set ) {
            return;
        }

        this._prepare( editor );
        let db = editor.db();
        let join = this._join;

        if ( join.table ) {
            let query = db( join.table );

            for ( let i=0, ien=ids.length ; i<ien ; i++ ) {
                query.orWhere( { [join.parent[1]]: ids[i] } );
            }

            await query.del();
        }
        else {
            let query = db( this._table );

            query.where( function () {
                for ( let i=0, ien=ids.length ; i<ien ; i++ ) {
                    query.orWhere( { [join.child.toString()]: ids[i] } );
                }
            } );

            this._applyWhere( query );

            await query.del();
        }
    }

    public async validate ( errors, editor: Editor, data: object ): Promise<void> {
        if ( ! this._set || ! data[ this._name ] ) {
            return;
        }

        this._prepare( editor );
        let joinData = data[ this._name ];

        for ( let i=0, ien=joinData.length ; i<ien ; i++ ) {
            await this._validateFields( errors, editor, joinData[i], this._name+'[].' );
        }
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Private methods
     */
    private _applyWhere( query: knex ): void {
        let where = this._where;

        for ( let i=0, ien=where.length ; i<ien ; i++ ) {
            query.where( where[i] );
        }
    }

    private async _insert ( db: knex, parentId: string, data: object ): Promise<void> {
        let join = this._join;
        let fields = this.fields();

        if ( join.table ) {
            // Insert keys into the join table
            await db( join.table )
                .insert( {
                    [join.parent[1]]: parentId,
                    [join.child[1]]: data[ join.child[0] ]
                } );
        }
        else {
            // Insert values into the target table
            let set = {
                [join.child.toString()]: parentId
            };

            for ( let i=0, ien=fields.length ; i<ien ; i++ ) {
                let field = fields[i];

                if ( field.apply('create', data) ) {
                    set[ field.dbField() ] = field.val( 'set', data );
                }
            }

            await db( this._table )
                .insert( set );
        }
    }


    private _prepare( editor: Editor ): void {
        this._editor = editor;

        let links = this._links;
        let editorTable = editor.table()[0];
        let joinTable = this.table();

        // FUTURE aliasParentTable

        if ( links.length === 2 ) {
            // No link table
            let f1 = links[0].split('.');
            let f2 = links[1].split('.');

            if ( f1[0] === editorTable ) {
                this._join.parent = f1[1];
                this._join.child = f2[1];
            }
            else {
                this._join.parent = f2[1];
                this._join.child = f1[1];
            }
        }
        else {
            // Link table
            let f1 = links[0].split('.');
            let f2 = links[1].split('.');
            let f3 = links[2].split('.');
            let f4 = links[3].split('.');

            // Discover the name of the link table
            if ( f1[0] !== editorTable && f1[0] !== joinTable ) {
                this._join.table = f1[0];
            }
            else if ( f2[0] !== editorTable && f2[0] !== joinTable ) {
                this._join.table = f2[0];
            }
            else if ( f3[0] !== editorTable && f3[0] !== joinTable ) {
                this._join.table = f3[0];
            }
            else {
                this._join.table = f4[0]
            }

            this._join.parent = [ f1[1], f2[1] ];
            this._join.child = [ f3[1], f4[1] ];
        }
    }

    private async _validateFields( errors, editor: Editor, data: object, prefix: string ): Promise<void> {
        let fields = this.fields();

        for ( let i=0, ien=fields.length ; i<ien ; i++ ) {
            let field = fields[i];
            let validation = await field.validate( data, editor );

            if ( validation !== true ) {
                errors.push( {
                    name: prefix+field.name(),
                    status: validation
                } );
            }
        }
    }
}