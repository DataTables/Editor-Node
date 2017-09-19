import knex from 'knex';

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export interface IOption {
    label: string;
    value: string|number;
}

export type IRenderer = ( row: object ) => string;
export type CustomOptions = ( db: knex ) => Promise<IOption[]>;

export default class Options {
    private _table: string;
    private _value: string;
    private _label: string[];
    private _limit: number;
    private _renderer: IRenderer;
    private _where: any;
    private _order: string;

    public label(): string;
    public label(label: string[]): Options;
    public label(label?: string[]): any {
        if ( label === undefined ) {
            return this._label;
        }

        if ( Array.isArray( label ) ) {
            this._label = label;
        }
        else {
            this._label = [ label ];
        }

        return this;
    }

    public limit(): number;
    public limit(limit: number): Options;
    public limit(limit?: number): any {
        if ( limit === undefined ) {
            return this._limit;
        }

        this._limit = limit;
        return this;
    }

    public order(): string;
    public order(order: string): Options;
    public order(order?: string): any {
        if ( order === undefined ) {
            return this._order;
        }

        this._order = order;
        return this;
    }

    public render(): IRenderer;
    public render(fn: IRenderer): Options;
    public render(fn?: IRenderer): any {
        if ( fn === undefined ) {
            return this._renderer;
        }

        this._renderer = fn;
        return this;
    }

    public table(): string;
    public table(table: string): Options;
    public table(table?: string): any {
        if ( table === undefined ) {
            return this._table;
        }

        this._table = table;
        return this;
    }

    public value(): string;
    public value(value: string): Options;
    public value(value?: string): any {
        if ( value === undefined ) {
            return this._value;
        }

        this._value = value;
        return this;
    }

    public where(): any;
    public where(where: any): Options;
    public where(where?: any): any {
        if ( where === undefined ) {
            return this._where;
        }

        this._where = where;
        return this;
    }

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Internal methods
	 */
    public async exec( db: knex ): Promise<IOption[]> {
        let label = this._label;
        let value = this._value;
        let formatter = this._renderer;

        // Create a list of the fields that we need to get from the db
        let fields = [ value ].concat( label );

        // We need a default formatter if one isn't provided
        if ( ! formatter ) {
            formatter = function( row ) {
                let a = [];

                for ( let i = 0, ien = label.length ; i < ien ; i++ ) {
                    a.push( row[ label[i] ] );
                }

                return a.join(' ');
            };
        }

        // Get the data
        let q = db( this._table )
            .distinct( fields )
            .select();

        if ( this._where ) {
            q.where( this._where );
        }

        if ( this._order ) {
            q.order( this._order );
        }

        if ( this._limit ) {
            q.limit( this.limit );
        }

        let res = await q;
        let out = [];

        // Create the output array
        for ( let i = 0, ien = res.length ; i < ien ; i++ ) {
            out.push( {
                label: formatter( res[i] ),
                value: res[i][ value ]
            } );
        }

        // Only sort if there was no SQL order field
        if ( ! this._order ) {
            out.sort( function( a, b ) {
                if ( isNumeric(a) && isNumeric(b) ) {
                    return (a.label * 1) - (b.label * 1);
                }
                return a.label < b.label ?
                    -1 : a.label > b.label ?
                        1 :
                        0;
            } );
        }

        return out;
    }
}
