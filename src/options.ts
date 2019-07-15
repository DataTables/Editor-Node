import * as knex from 'knex';

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

export interface IOption {
	label: string;
	value: string|number;
}

export type IRenderer = ( row: object ) => string;
export type CustomOptions = ( db: knex ) => Promise<IOption[]>;

/**
 * The Options class provides a convenient method of specifying where Editor
 * should get the list of options for a `select`, `radio` or `checkbox` field.
 * This is normally from a table that is _left joined_ to the main table being
 * edited, and a list of the values available from the joined table is shown to
 * the end user to let them select from.
 *
 * `Options` instances are used with the {@link Field.options} method.
 *
 * @export
 * @class Options
 */
export default class Options {
	private _table: string;
	private _value: string;
	private _label: string[];
	private _limit: number;
	private _renderer: IRenderer;
	private _where: any;
	private _order: string;
	private _manualOpts: IOption[] = [];

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods
	 */

	/**
	 * Add extra options to the list, in addition to any obtained from the database
	 *
	 * @param label Label
	 * @param value Value
	 */
	public add( label: string, value?: string ) {
		if ( value === undefined ) {
			value = label;
		}

		this._manualOpts.push( {
			label,
			value
		} );

		return this;
	}

	/**
	 * Get the column(s) to be used for the label
	 *
	 * @returns {string[]} Label columns
	 */
	public label(): string[];
	/**
	 * Set the column(s) to be used for the label
	 *
	 * @param {string[]} label Database column names
	 * @returns {Options} Self for chaining
	 */
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

	/**
	 * Get the currently applied LIMIT
	 *
	 * @returns {number} Limit
	 */
	public limit(): number;
	/**
	 * Set the LIMIT clause to limit the number of records returned
	 *
	 * @param {number} limit Limit
	 * @returns {Options} Self for chaining
	 */
	public limit(limit: number): Options;
	public limit(limit?: number): any {
		if ( limit === undefined ) {
			return this._limit;
		}

		this._limit = limit;
		return this;
	}

	/**
	 * Get the ORDER BY clause for the SQL.
	 *
	 * @returns {string} ORDER BY clause
	 */
	public order(): string;
	/**
	 * Set the ORDER BY clause to use in the SQL. If this option is not
	 * provided the ordering will be based on the rendered output, either
	 * numerically or alphabetically based on the data returned by the renderer.
	 *
	 * @param {string} order ORDER BY statement
	 * @returns {Options} Self for chaining
	 */
	public order(order: string): Options;
	public order(order?: string): any {
		if ( order === undefined ) {
			return this._order;
		}

		this._order = order;
		return this;
	}

	/**
	 * Get the configured label renderer
	 *
	 * @returns {IRenderer} Self for chaining
	 */
	public render(): IRenderer;
	/**
	 * Set the label renderer. The renderer can be used to combine
	 * multiple database columns into a single string that is shown as the label
	 * to the end user in the list of options.
	 *
	 * @param {IRenderer} fn Renderering function
	 * @returns {Options} Self for chaining
	 */
	public render(fn: IRenderer): Options;
	public render(fn?: IRenderer): any {
		if ( fn === undefined ) {
			return this._renderer;
		}

		this._renderer = fn;
		return this;
	}

	/**
	 * Get the table that the options will be gathered from.
	 *
	 * @returns {string} Table name
	 */
	public table(): string;
	/**
	 * Set the database table from which to gather the options for the list.
	 *
	 * @param {string} table Table name
	 * @returns {Options} Self for chaining
	 */
	public table(table: string): Options;
	public table(table?: string): any {
		if ( table === undefined ) {
			return this._table;
		}

		this._table = table;
		return this;
	}

	/**
	 * Get the column name to use for the value in the options list.
	 *
	 * @returns {string} Column name
	 */
	public value(): string;
	/**
	 * Set the column name to use for the value in the options list. This would
	 * normally be the primary key for the table.
	 *
	 * @param {string} value Column name
	 * @returns {Options} Self for chaining
	 */
	public value(value: string): Options;
	public value(value?: string): any {
		if ( value === undefined ) {
			return this._value;
		}

		this._value = value;
		return this;
	}

	/**
	 * Get the WHERE condition for this option set.
	 *
	 * @returns {*} Knex WHERE condition
	 */
	public where(): any;
	/**
	 * Set the method to use for a WHERE condition if one is to be applied to
	 * the query to get the options.
	 *
	 * @param {*} where Knex WHERE condition
	 * @returns {Options} Self for chaining
	 */
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

	/**
	 * @ignore
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
		let q = db
			.select()
			.from( this._table )
			.distinct( fields );

		if ( this._where ) {
			q.where( this._where );
		}

		if ( this._order ) {
			// For cases where we are ordering by a field which isn't included in the list
			// of fields to display, we need to add the ordering field, due to the
			// select distinct.
			this._order.split(',').forEach( (val) => {
				let field = val.toLocaleLowerCase()
					.replace(' asc', '')
					.replace( 'desc', '')
					.trim();

				if ( ! fields.includes( field ) ) {
					q.select( field );
				}
			} );

			q.orderBy( this._order );
		}

		if ( this._limit ) {
			q.limit( this.limit() );
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

		// Stick on any extra manually added options
		if ( this._manualOpts.length ) {
			out = out.concat( this._manualOpts );
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
