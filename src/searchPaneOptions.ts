import * as knex from 'knex';
import {Knex} from 'knex';

import Field from './field';
import Editor, {ILeftJoin} from './editor';
import {leftJoin} from './helpers';

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

export interface IOption {
	label: string;
	value: string | number;
}
export type IRenderer = (str: string) => string;
export type CustomOptions = (db: Knex) => Promise<IOption[]>;

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
	private _leftJoin: ILeftJoin[] = [];
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
	public leftJoin(table: string, field1: string | Function, operator: string, field2: string): this {
		if (typeof field1 === 'function') {
			this._leftJoin.push({
				field1: '',
				field2: '',
				fn: field1,
				operator: '',
				table,
			});
		}
		else {
			this._leftJoin.push({
				field1,
				field2,
				operator,
				table,
			});
		}

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
		let fields = fieldsIn;
		let db = editor.db();
		let viewCount = http.searchPanes_options
			? http.searchPanes_options.viewCount === 'true'
			: true;
		let viewTotal = http.searchPanes_options
			? http.searchPanes_options.viewTotal === 'true'
			: false;
		let cascade = http.searchPanes_options
			? http.searchPanes_options.cascade === 'true'
			: false;
		let entries = null;

		// If the value is not yet set then set the variable to be the field name
		let value = this._value
			? this._value
			: field.dbField();

		// If the table is not yet set then set the table variable to be the same as editor
		// This is not taking a value from the SearchPaneOptions instance as the table should be defined in value/label. This throws up errors if not.
		let table = editor.table()[0];
		let readTable = editor.readTable();

		if (this._table) {
			table = this._table;
		}
		else if(readTable.length) {
			table = readTable[0];
		}

		// If the label value has not yet been set then just set it to be the same as value
		let label = this._label
			? this._label
			: value;

		let formatter = this._renderer
			? this._renderer
			: d => d;

		// Use Editor's left joins and merge in any additional from this instance
		let join = this._leftJoin.slice();

		if (leftJoinIn) {
			for (let i=0 ; i<leftJoinIn.length ; i++) {
				let found = false;

				for (let j=0 ; j<join.length ; j++) {
					if (join[j].table === leftJoinIn[i].table) {
						found = true;
					}
				}

				if (! found) {
					join.push(leftJoinIn[i]);
				}
			}
		}

		// Get the data for the pane options
		let q = db
			.distinct()
			.select(label + ' as label', value + ' as value')
			.from(table)
			.groupBy(value);

		if (this._where) {
			q.where(this._where);
		}

		// If not cascading, then the total and count must be the same
		if (viewTotal) {
			q.count({total: '*'});
		}

		leftJoin(q, join);

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

		let rows = await q;

		// Remove any filtering entries that don't exist in the database (values might have changed)
		if (http.searchPanes && http.searchPanes[field.name()]) {
			let values = rows.map(r => r.value);
			let selected = http.searchPanes[field.name()];

			for (let i=selected.length-1 ; i>=0 ; i--) {
				if (! values.includes(selected[i])) {
					http.searchPanes[field.name()].splice(i, 1);
				}
			}
		}

		// Apply filters to cascade tables
		if (viewCount || cascade) {
			let query = db.table(table);

			leftJoin(query, join);

			if (field.apply('get') && ! field.getValue()) {
				query
					.distinct()
					.select(value + ' as value')
					.groupBy(value);

				// We viewTotal is enabled, we need to do a count to get the number of records,
				// If it isn't we still need to know it exists, but don't care about the cardinality
				if (viewCount) {
					query.count({count: '*'});
				}
				else {
					query.select('(1) as count');
				}
			}

			// Construct the where queries based upon the options selected by the user
			for (let fie of fields) {
				let add = false;
				let fieName = fie.name();

				// If there is a last value set then a slightly different set of results is required for cascade
				// That panes results are based off of the results when only considering the selections of all of the others
				if (http.searchPanesLast && field.name() === http.searchPanesLast) {
					if (http.searchPanes[fieName] !== undefined && fieName !== http.searchPanesLast) {
						add = true;
					}
				}
				else if (http.searchPanes && http.searchPanes[fieName] !== undefined) {
					add = true;
				}

				if (add) {
					query.where(function() {
						for (let i = 0; i < http.searchPanes[fieName].length; i++) {
							if(http.searchPanes_null !== undefined && http.searchPanes_null[fieName][i]) {
								this.orWhereNull(fieName);
							}
							else {
								this.orWhere(fieName, http.searchPanes[fieName][i]);
							}
						}
					});
				}
			}

			let entriesRows = await query;

			// Key by value for fast lookup
			entries = {};
			entriesRows.forEach(r => {
				entries[r.value] = r;
			});
		}

		let out = [];
		
		for (let i=0 ; i<rows.length ; i++) {
			let row = rows[i];
			let value = row.value;
			let total = row.total !== undefined ? row.total : null;
			let count = total;

			if (entries) {
				count = entries[value] && entries[value].count
					? entries[value].count
					: 0;

				// For when viewCount is enabled and viewTotal is not
				// the total needs to be the same as the count!
				if (total === null) {
					total = count;
				}
			}

			out.push({
				label: formatter(row.label),
				total: total,
				value: value,
				count: count
			});
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
