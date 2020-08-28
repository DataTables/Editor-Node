import * as knex from 'knex';
import Field from './field';
import Editor from './editor';

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

export interface IOption {
	label: string;
	value: string | number;
}

export type IRenderer = (str: string) => string;
export type CustomOptions = (db: knex) => Promise<IOption[]>;

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
export default class SearchPaneOptions {
	private _table: string;
	private _value: string;
	private _label: string[];
	private _leftJoin: Array<{[keys: string]: string}>;
	private _renderer: IRenderer;
	private _where: any;
	private _order: string;

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods
	 */

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
	public label(label: string[]): SearchPaneOptions;
	public label(label?: string[]): any {
		if (label === undefined) {
			return this._label;
		}

		this._label = Array.isArray(label) ?
			label :
			[label];

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
	public order(order: string): SearchPaneOptions;
	public order(order?: string): any {
		if (order === undefined) {
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
	public render(fn: IRenderer): SearchPaneOptions;
	public render(fn?: IRenderer): any {
		if (fn === undefined) {
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
	public table(table: string): SearchPaneOptions;
	public table(table?: string): any {
		if (table === undefined) {
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
	public value(value: string): SearchPaneOptions;
	public value(value?: string): any {
		if (value === undefined) {
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
	public where(where: any): SearchPaneOptions;
	public where(where?: any): any {
		if (where === undefined) {
			return this._where;
		}

		this._where = where;
		return this;
	}

	/**
	 * Set the method to use for a leftJoin condition if one is to be applied
	 * to the query to retrieve data from two tables
	 *
	 * @param table the table for the join
	 * @param field1 the first field
	 * @param operator operator for the join
	 * @param field2 the second field
	 */
	public leftJoin(table: string, field1: string, operator: string, field2: string): this {
		if(this._leftJoin === undefined || this._leftJoin === null) {
			this._leftJoin = [];
		}

		this._leftJoin.push({
			field1,
			field2,
			operator,
			table
		});
		return this;
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Internal methods
	 */

	/**
	 * Execution function for getting the SearchPane options
	 * @param field The field to retrieve data from
	 * @param editor The editor instance
	 * @param http The http sent to the server
	 * @param fieldsIn All of the fields
	 * @param leftJoinIn Info for a leftJoin if required
	 */
	public async exec(
		field: Field, editor: Editor, http: any, fieldsIn: any, leftJoinIn: any
	): Promise<IOption[]> {
		let label;
		let value;
		let table;
		let formatter = this._renderer;
		let join = this._leftJoin;
		let fields = fieldsIn;

		// First get a value for `value`. This can be retrieved from either the
		//  SearchPaneOptions or the fieldName if it has not been declared
		if (this._value === undefined) {
			let spopts = field.searchPaneOptions();
			value = spopts.label() !== undefined ?
				spopts.label()[0] :
			 	value = field.name();
		}
		// Otherwise we can just get it from the value that has been defined
		else {
			value = this._value;
		}

		// If label is undefined then just assume the same value as `value`
		if (this._label === undefined) {
			label = value;
		}
		// Otherwise work it out from what has been defined
		else {
			label = this._label;
		}

		// If the table has not been defined then get it from the editor instance
		table = this._table === undefined ?
			editor.table()[0] :
			this._table;

		if (leftJoinIn !== undefined && leftJoinIn !== null && this._leftJoin === undefined) {
			join = leftJoinIn;
		}

		let db = editor.db();

		// Create a list of the fields that we need to get from the db
		// let fields = [ value ].concat(label);

		// We need a default formatter if one isn't provided
		if (! formatter) {
			formatter = function(str) {
				return str;
			};
		}

		// This query will get the count's according to any selections made in the SearchPanes
		let query = db
			.select(label + ' as label', value + ' as value')
			.count({count: '*'})
			.from(table)
			.distinct()
			.groupBy(value);

		// This block applies all of the where conditions across the fields
		// Each field gets it's own where condition which must be satisfied
		// Each where condition can have multiple orWhere()s so that the or
		//  searching within the fields works.
		if (http.searchPanes !== undefined) {
			for (let fie of fields) {
				if (http.searchPanes[fie.name()] !== undefined) {
					query.where(function() {
						for (let opt of http.searchPanes[fie.name()]) {
							this.orWhere(fie.name(), opt);
						}
					});
				}
			}
		}

		// This query will get the total count for the field, assuming no filtering.
		// This is necessary for viewTotal and cascadePanes functionality
		let q = db
			.select(label + ' as label', value + ' as value')
			.count({total: '*'})
			.from(table)
			.distinct()
			.groupBy(value);

		if (this._where) {
			q.where(this._where);
		}

		// If a left join needs to be done for the above queries we can just do it in the same place
		if (join !== null && join !== undefined) {
			for (let joiner of join) {
				q.leftJoin(joiner.table, joiner.field1, joiner.field2);
				query.leftJoin(joiner.table, joiner.field1, joiner.field2);
			}
		}

		if (this._order) {
			// For cases where we are ordering by a field which isn't included in the list
			// of fields to display, we need to add the ordering field, due to the
			// select distinct.
			this._order.split(',').forEach((val) => {
				let fie = val.toLocaleLowerCase()
					.replace(' asc', '')
					.replace('desc', '')
					.trim();

				if (! fields.includes(fie)) {
					q.select(fie);
				}
			});

			q.orderBy(this._order);
		}

		let res = await q;
		let cts = await query;
		let out = [];

		// Create the output array and add the values of count, label, total and value for each unique entry
		for (let recordCou of res) {
			let set = false;

			for (let recordTot of cts) {
				if (recordTot.value === recordCou.value) {
					out.push({
						count: recordTot.count,
						label: formatter(recordCou.label),
						total: recordCou.total,
						value: recordCou.value
					});
					set = true;
					break;
				}
			}

			// If the values are not found then the count is 0 according to `query` so add it anyway but with that value
			if (!set) {
				out.push({
					count: 0,
					label: formatter(recordCou.label),
					total: recordCou.total,
					value: recordCou.value
				});
			}
		}

		// Only sort if there was no SQL order field
		if (! this._order) {
			out.sort(function(a, b) {
				if (isNumeric(a) && isNumeric(b)) {
					return (a.label * 1) - (b.label * 1);
				}
				return a.label < b.label ?
					-1 : a.label > b.label ?
						1 :
						0;
			});
		}
		return out;
	}
}
