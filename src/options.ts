import * as knex from 'knex';
import {Knex} from 'knex';
import {ILeftJoin} from './editor';
import {leftJoin} from './helpers';

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

export interface IOption {
	label: string;
	value: string | number;
}

export type IRenderer = (row: object) => string;
export type CustomOptions = (db: Knex, search?: string) => Promise<IOption[]>;

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
	private _alwaysRefresh: boolean = true;
	private _customFn: CustomOptions;
	private _includes: string[] = [];
	private _searchOnly: boolean = false;
	private _table: string;
	private _value: string;
	private _label: string[];
	private _leftJoin: ILeftJoin[] = [];
	private _limit: number;
	private _renderer: IRenderer;
	private _where: any;
	private _order: string | boolean = true;
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
	public add(label: string, value?: string) {
		if (value === undefined) {
			value = label;
		}

		this._manualOpts.push({
			label,
			value
		});

		return this;
	}

	/**
	 * Get the current alwaysRefresh flag
	 */
	public alwaysRefresh(): boolean;
	/**
	 * Set the flag to indicate that the options should always be refreshed (i.e. on get, create,
	 * edit and delete) or only on the initial data load (false).
	 *
	 * @param set Flag to set the always refresh to
	 */
	public alwaysRefresh(set: boolean): Options;
	public alwaysRefresh(set?: boolean): any {
		if (set === undefined) {
			return this._alwaysRefresh;
		}

		this._alwaysRefresh = set;

		return this;
	}

	/**
	 * Get the function (if set) to get the options
	 */
	public fn(): CustomOptions;
	/**
	 * Set the function used to get the options, rather than using the built in DB configuration.
	 *
	 * @param set Function to use for the custom options function
	 */
	public fn(set: CustomOptions): Options;
	public fn(set?: CustomOptions): any {
		if (set === undefined) {
			return this._customFn;
		}

		this._customFn = set;

		return this;
	}

	/**
	 * Get the list of field names to include in the option objects
	 */
	public include(): string[];
	/**
	 * Column names from `value()` and `label()` that should be included in the output object for
	 * each option, in addition to the value and label.
	 *
	 * @param set The list of columns to include in the output
	 */
	public include(set: string[] | string): Options;
	public include(set?: string[] | string): any {
		if (set === undefined) {
			return this._includes;
		}

		if (Array.isArray(set)) {
			this._includes.push.apply(this._includes, set);
		}
		else {
			this._includes.push(set);
		}

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
	public label(label: string | string[]): Options;
	public label(label?: string | string[]): any {
		if (label === undefined) {
			return this._label;
		}

		if (Array.isArray(label)) {
			this._label = label;
		}
		else {
			this._label = [label];
		}

		return this;
	}

	/**
	 * Add a left join condition to the Options instance, allowing it to operate
	 * over multiple tables.
	 *
	 * In this form the method will take a function as the second parameter which
	 * is a Knex callback function allowing a complex join expression to be built.
	 * @param {string} table Table name to do a join onto
	 * @param {function} condition
	 * @returns {Editor} Self for chaining
	 */
	public leftJoin(table: string, condition: Function): Options;
	/**
	 * Add a left join condition to the Options instance, allowing it to operate
	 * over multiple tables.
	 * @param {string} table Table name to do a join onto
	 * @param {string} field1 Field from the parent table to use as the join link
	 * @param {string} operator Join condition (`=`, '<`, etc)
	 * @param {string} field2 Field from the child table to use as the join link
	 * @returns {Editor} Self for chaining
	 */
	public leftJoin(table: string, field1: string, operator: string, field2: string): Options;
	public leftJoin(
		table: string,
		field1: string | Function,
		operator: string | undefined = undefined,
		field2: string | undefined = undefined
	): Options {
		if (typeof field1 === 'function') {
			this._leftJoin.push({
				field1: '',
				field2: '',
				fn: field1,
				operator: '',
				table
			});
		}
		else {
			this._leftJoin.push({
				field1,
				field2,
				operator,
				table
			});
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
		if (limit === undefined) {
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
	 * Set the ORDER BY clause to use in the SQL. If this option is `true`
	 * (which it is by default) the ordering will be based on the rendered output,
	 * either numerically or alphabetically based on the data returned by the
	 * renderer. If `false` no ordering will be performed and whatever is returned
	 * from the database will be used.
	 *
	 * @param {string|boolean} order ORDER BY statement
	 * @returns {Options} Self for chaining
	 */
	public order(order: string | boolean): Options;
	public order(order?: string | boolean): any {
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
	public render(fn: IRenderer): Options;
	public render(fn?: IRenderer): any {
		if (fn === undefined) {
			return this._renderer;
		}

		this._renderer = fn;
		return this;
	}

	/**
	 * Get the current search only flag
	 */
	public searchOnly(): boolean;
	/**
	 * Set the flag to indicate if the options should always be refreshed (i.e. on get, create
	 * and edit) or only on the initial data load (false).
	 *
	 * @param set Flag to set the search only option to
	 */
	public searchOnly(set: boolean): Options;
	public searchOnly(set?: boolean): any {
		if (set === undefined) {
			return this._searchOnly;
		}

		this._searchOnly = set;

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
	public value(value: string): Options;
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
	public where(where: any): Options;
	public where(where?: any): any {
		if (where === undefined) {
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
	public async exec(
		db: Knex,
		refresh,
		search: string = null,
		find: any[] = null
	): Promise<IOption[] | false> {
		// If search only, and not a search action, then just return false
		if (this.searchOnly() && search === null && find === null) {
			return false;
		}

		// Only get the options if doing a full load, or always is set
		if (refresh === true && !this.alwaysRefresh()) {
			return false;
		}

		if (this._customFn) {
			return this._customFn(db, search);
		}

		let label = this._label;
		let value = this._value;
		let formatter = this._renderer;
		let out = [];
		let max = this._limit;

		// We need a default formatter if one isn't provided
		if (!formatter) {
			formatter = function (row) {
				let a = [];

				for (let i = 0, ien = label.length; i < ien; i++) {
					a.push(row[label[i]]);
				}

				return a.join(' ');
			};
		}

		// Get database data
		let options = await this.execDb(db, find);

		// Manually added options
		for (let i = 0; i < this._manualOpts.length; i++) {
			options.push(this._manualOpts[i]);
		}

		// Create the output array
		for (let i = 0, ien = options.length; i < ien; i++) {
			let rowLabel = formatter(options[i]);
			let rowValue = options[i][value];

			// Apply the search to the rendered label. Need to do it here rather than in SQL since
			// the label is rendered in script.
			if (
				search === null ||
				search === '' ||
				rowLabel.toLowerCase().indexOf(search.toLowerCase()) === 0
			) {
				let option = {
					label: rowLabel,
					value: rowValue
				};

				// Add in any columns that are needed for extra data (includes)
				for (let j = 0; j < this._includes.length; j++) {
					let inc = this._includes[j];

					if (options[i][inc] !== undefined) {
						option[inc] = options[i][inc];
					}
				}

				out.push(option);
			}

			// Limit needs to be done in script space, rather than SQL, to allow for the script
			// based filtering above, and also for when using a custom function
			if (max !== null && out.length >= max) {
				break;
			}
		}

		// Local sorting
		if (this._order === true) {
			out.sort(function (a, b) {
				let aLabel = a.label;
				let bLabel = b.label;

				if (aLabel === null) {
					aLabel = '';
				}

				if (bLabel === null) {
					bLabel = '';
				}

				if (isNumeric(aLabel) && isNumeric(bLabel)) {
					return aLabel * 1 - bLabel * 1;
				}

				return aLabel < bLabel ? -1 : aLabel > bLabel ? 1 : 0;
			});
		}

		return out;
	}

	/**
	 * Get the list of options from the database based on the configuration
	 *
	 * @param db Database connection
	 * @param find Values to search for
	 * @returns List of found options
	 */
	public async execDb(db: Knex, find: any[]) {
		if (!this._table) {
			return [];
		}

		// Create a list of the fields that we need to get from the db
		let fields = [this._value].concat(this._label);

		// Options query
		let q = db
			.select(fields)
			.distinct()
			.from(this._table);

		if (this._where) {
			q.where(this._where);
		}

		if (Array.isArray(find)) {
			q.whereIn(this._value, find);
		}

		if (typeof this._order === 'string') {
			// For cases where we are ordering by a field which isn't included in the list
			// of fields to display, we need to add the ordering field, due to the
			// select distinct.
			this._order.split(',').forEach((val) => {
				val = val.toLocaleLowerCase();

				const direction = val.match(/( desc| asc)/g);
				const field = val.replace(/( desc| asc$)/, '').trim();

				if (!fields.includes(field)) {
					q.select(field);
				}

				q.orderBy(field, direction ? direction[0].trim() : 'asc');
			});
		}
		else if (this._order === true) {
			// Attempt to do a database order, needed for `limit()`ed results
			q.orderBy(this._label[0], 'asc');
		}

		leftJoin(q, this._leftJoin);

		let res = await q;

		return res;
	}

	/**
	 * Get the objects for a set of values.
	 *
	 * @param db  Database connection
	 * @param ids IDs to get
	 *
	 * @return array|bool List of options
	 */
	public async find(db: Knex, ids: any[]): Promise<IOption[] | false> {
		return this.exec(db, false, null, ids);
	}

	/**
	 * Do a search for data on the source.
	 *
	 * @param db   Database connection
	 * @param term Search term
	 *
	 * @return array|bool List of options
	 */
	public async search(db: Knex, term: string): Promise<IOption[] | false> {
		return this.exec(db, false, term);
	}
}
