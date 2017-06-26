
import knex from 'knex';
import Field from './field';

export default class Editor {
    private _db: knex;
    private _table: string[] = [];
    private _pkey: string[] = [];
    private _fields: Field[] = [];
    private _out = {}; // TODO type


    constructor( db: knex=null, table:string|string[]=null, pkey: string|string[]=null ) {
        this.db( db );
        this.table( table );
        this.pkey( pkey );
    }


    public db (): knex;
    public db (db: knex): Editor;
    public db (db?: knex): any {
        if ( db === undefined ) {
            return this._db;
        }

        this._db = db;
        return this;
    }

    public table (): string[];
    public table (table: string|string[]): Editor;
    public table (table?: string|string[]): any {
        if ( table === undefined ) {
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


    public field ( nameOrField: Field|string ) {
        if ( typeof nameOrField === 'string' ) {
            // Find the field
            throw new Error( 'Unknown field: '+nameOrField );
        }

        this._fields.push( nameOrField );
        return this;
    }


    public fields (): Field[];
    public fields (...fields: Field[]): Editor;
    public fields (...fields: Field[]): any {
        if ( fields === undefined ) {
            return this._fields;
        }

        this._fields.push.apply( this._fields, fields );
        
        return this;
    }

    public data (): object { // TODO type
        return this._out;
    }


    public async process ( data: object ): Promise<Editor> {
        await this._process( data );

        return this;
    }




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

            query.select( fields[i].dbField() );
        }

        let result = await query;

        return {
            data: result
        }
    }
}
