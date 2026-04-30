import { Knex } from 'knex';
import { IDtResponse } from '.';
import { Mjoin } from '../dist';
import Column from './column';
import Editor, { IDtRequest } from './editor';
import { IUpload } from './upload';

/**
 * This class let's you define the structure of a database, in order for it to
 * be read and the data returned to DataTables.
 *
 * Typically you will:
 *
 * * Create the instance
 * * Define the columns
 * * Process the request
 * * Return JSON to the client-side
 *
 * You may also wish to add query conditions, or provide extra pre-column
 * options for features such as ColumnControl.
 */
export default class DataTable {
	private _editor: Editor;
	private _columns: Column[] = [];

	/**
	 * Create a new DataTable instance for getting data from a database.
	 *
	 * @param db Database connection object
	 * @param table The table name in the database to read and write information
	 *   from and to. Can be given here or with the 'table' method.
	 * @param pkey Primary key column name in the table given in
	 */
	constructor(
		db?: Knex,
		table?: string | string[],
		pkey?: string | string[]
	) {
		this._editor = new Editor(db, table, pkey);
		this._editor.write(false);
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods
	 */

	/**
	 * Get a column based on its name
	 *
	 * @param name Column name
	 * @returns Column, or throws if no column found
	 */
	public column(name: string): Column;
	/**
	 * Add a new column
	 *
	 * @param column Column to add
	 * @returns Self for chaining
	 */
	public column(column: Column): DataTable;
	public column(nameOrColumn: string | Column): any {
		if (typeof nameOrColumn === 'string') {
			for (let i = 0; i < this._columns.length; i++) {
				if (this._columns[i].name() === nameOrColumn) {
					return this._columns[i];
				}

				throw new Error('Unknown column: ' + nameOrColumn);
			}
		}

		return this.columns(nameOrColumn as Column);
	}

	/**
	 * Get all Column instances assigned to this DataTable
	 *
	 * @returns Column array
	 */
	public columns(): Column[];
	/**
	 * Add one or more columns
	 *
	 * @param columns Array of columns
	 * @returns Self for chaining
	 */
	public columns(columns: Column[]): DataTable;
	/**
	 * Add one or more columns
	 *
	 * @param columns Columns as parameters
	 * @returns Self for chaining
	 */
	public columns(...columns: Column[]): DataTable;
	public columns(columns?: any): any {
		if (!columns) {
			return this._columns;
		}

		let cols = Array.from(arguments).flat();

		for (let i = 0; i < cols.length; i++) {
			this._columns.push(cols[i]);
			this._editor.field(cols[i].field());
		}

		return this;
	}

	/**
	 * Get the data constructed in this instance.
	 *
	 * @returns Data object
	 */
	public data(): IDtResponse {
		return this._proxy('data');
	}

	/**
	 * Get the database connection assigned to the instance.
	 *
	 * @returns Knex db interface
	 */
	public db(): Knex;
	/**
	 * Set the database connection.
	 *
	 * @param Knex db interface
	 * @returns Self for chaining
	 */
	public db(db: Knex): Editor;
	public db(db?: Knex): any {
		return this._proxy('db', [db]);
	}

	/**
	 * Get the debug setting for this instance
	 * @returns Debug enabled (true) or not
	 */
	public debug(): boolean;
	/**
	 * Set the debug setting for this instance
	 * @param set Debug flag
	 * @returns Self for chaining
	 */
	public debug(set: boolean): DataTable;
	/**
	 * Add a debug message
	 * @param message Message to add
	 * @returns Self for chaining
	 */
	public debug(message: any): DataTable;
	public debug(param?: any): any {
		return this._proxy('debug', [param]);
	}

	/**
	 * Get the id prefix.
	 *
	 * Typically primary keys are numeric and this is not a valid ID value in an
	 * HTML document - is also increases the likelihood of an ID clash if
	 * multiple tables are used on a single page. As such, a prefix is assigned
	 * to the primary key value for each row, and this is used as the DOM ID,
	 *
	 * @returns id prefix
	 */
	public idPrefix(): string;
	/**
	 * Get the id prefix.
	 *
	 * @param idPrefix Prefix to use.
	 * @returns Self for chaining
	 */
	public idPrefix(idPrefix: string): DataTable;
	public idPrefix(idPrefix?: string): any {
		return this._proxy('idPrefix', [idPrefix]);
	}

	/**
	 * Get the configured Mjoin instances.
	 *
	 * Note that for the majority of use cases you will want to use the
	 * `leftJoin()` method. It is significantly easier to use if you are just
	 * doing a simple left join!
	 *
	 * The list of Join instances that Editor will join the parent table to
	 * (i.e. the one that the {@link Editor.table} and {@link Editor.fields}
	 * methods refer to in this class instance).
	 *
	 * @returns Array of Mjoin instances
	 */
	public join(): Mjoin[];
	/**
	 * Add one or more Mjoin instances.
	 * @param join Mjoin instance to add.
	 * @returns Self for chaining.
	 */
	public join(...join: Mjoin[]): DataTable;
	public join(...join: Mjoin[]): any {
		return this._proxy('join', join);
	}

	/**
	 * Add a left join condition to the DataTable instance, allowing it to
	 * operate over multiple tables. Multiple `leftJoin()` calls can be made for
	 * a single DataTable instance to join multiple tables.
	 *
	 * In this form the method will take a function as the second parameter
	 * which is a Knex callback function allowing a complex join expression to
	 * be built.
	 *
	 * @param table Table name to do a join onto
	 * @param condition
	 * @returns Self for chaining
	 */
	public leftJoin(table: string, condition: Function): DataTable;
	/**
	 * Add a left join condition to the DataTable instance, allowing it to
	 * operate over multiple tables. Multiple `leftJoin()` calls can be made for
	 * a single DataTable instance to join multiple tables.
	 *
	 * A left join is the most common type of join that is used with DataTable
	 * so this method is provided to make its use very easy to configure. Its
	 * parameters are basically the same as writing an SQL left join statement.
	 *
	 * @param table Table name to do a join onto
	 * @param field1 Column name from the parent table to use as the join link
	 * @param operator Join condition (`=`, '<`, etc)
	 * @param field2 Column name from the child table to use as the join link
	 * @returns Self for chaining
	 */
	public leftJoin(
		table: string,
		field1: string,
		operator: string,
		field2: string
	): DataTable;
	public leftJoin(
		table: string,
		field1: string | Function,
		operator: string | undefined = undefined,
		field2: string | undefined = undefined
	): DataTable {
		return this._proxy('leftJoin', [table, field1, operator, field2]);
	}

	/**
	 * Add an event listener. The `DataTable` class will trigger an number of
	 * events that some action can be taken on.
	 *
	 * @param name Event name
	 * @param callback Event callback function that will be executed when the
	 *   event occurs.
	 * @returns Self for chaining.
	 */
	public on(name: string, callback: Function): DataTable {
		return this._proxy('on', [name, callback]);
	}

	/**
	 * Get the table name.
	 *
	 * The table name designated which DB table DataTable will use as its data
	 * source for working with the database. Table names can be given with an
	 * alias, which can be used to simplify larger table names. The field
	 * names would also need to reflect the alias, just like an SQL query. For
	 * example: `users as a`.
	 *
	 * @returns Configured table name
	 */
	public table(): string[];
	/**
	 * Set the table name.
	 *
	 * @param table Database table name to use
	 * @returns Self for chaining
	 */
	public table(table: string | string[]): DataTable;
	public table(table?: string | string[]): any {
		return this._proxy('on', [table]);
	}

	/**
	 * Get the primary key value.
	 *
	 * The primary key must be known to DataTable so it will know which rows are
	 * being edited / deleted upon those actions. The default value is ['id'].
	 *
	 * @returns Array of column names
	 */
	public pkey(): string[];
	/**
	 * Set the primary key value(s)
	 *
	 * @param pkey Primary key column name. Use an array of strings if using a
	 *   compound key.
	 * @returns Self for chaining.
	 */
	public pkey(pkey: string | string[]): DataTable;
	public pkey(pkey?: string | string[]): any {
		return this._proxy('pkey', [pkey]);
	}

	/**
	 * Process a request from the DataTable client-side to get / set data.
	 *
	 * @param data Form data sent from the client-side - e.g. `req.body`
	 * @param files File information, used for upload requests - e.g.
	 *   `req.files`
	 * @returns Promise that is fulfilled when Editor has completed its
	 *   processing - result is the Editor instance.
	 */
	public async process(
		data: IDtRequest,
		files: IUpload | null = null
	): Promise<DataTable> {
		return this._proxy('process', [data, files]);
	}

	/**
	 * Get the array of conditions applied to the method.
	 *
	 * @returns Knex where conditions.
	 */
	public where(): any[];
	/**
	 * Set a condition for the queries Editor will perform. Editor uses Knex to
	 * connect to the database, and exposes the knex object using this method so
	 * you can add any conditions you like that are supported by Knex.
	 *
	 * @param cond Knex query condition
	 * @returns Self for chaining.
	 */
	public where(...cond: Knex.Where[]): Editor;
	public where(...cond: Knex.Where[]): any {
		return this._proxy('process', cond);
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Helper method as this class is largely a proxy to `Field`
	 *
	 * @param method Method name to call
	 * @param args Arguments to pass on
	 * @returns Self if the field was returned (i.e. for chaining), or the value
	 *   if it was used as a getter.
	 */
	private _proxy(method: keyof Editor, args: any[] = []) {
		let fn = this._editor[method] as any;
		let ret = fn.apply(this._editor, args);

		if (ret === this._editor) {
			return this;
		}

		return ret;
	}
}
