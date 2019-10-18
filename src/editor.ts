import * as crc from 'crc';
import * as knex from 'knex';

import Field, {SetType} from './field';
import Format from './formatters';
import Mjoin from './mjoin';
import NestedData from './nestedData';
import {IUpload} from './upload';
import Validate from './validators';

/**
 * Action that has been requested by the client-side
 * (based on the `action` parameter).
 * @export
 */
export enum Action {
	/** Get data (used by DataTables). */
	Read,

	/** Create a new row. */
	Create,

	/** Edit one or more rows. */
	Edit,

	/** Delete one or more rows. */
	Delete,

	/** Upload a file. */
	Upload
}

/**
 * Field error object.
 * @export
 */
export interface IDtError {
	/** Field name in error. */
	name: string;

	/** Error message string. */
	status: string;
}

/**
 * DataTables request's order object.
 * @export
 */
export interface IDtOrder {
	/** Sorting direction. */
	dir: 'asc'|'desc';

	/** Column index to sort by. */
	column: number;
}

/**
 * DataTables request's column information object.
 * @export
 */
export interface IDtColumn {
	/** Data property (`columns.data`). */
	data: string;

	/** Searchable flag. */

	searchable: boolean;

	/** Search information object. */
	search: {
		/** Search string. */
		value: string;
	};
}

/**
 * DataTables request object. This is the information that DataTables
 * and Editor can send to the server.
 * @export
 */
export interface IDtRequest {
	/** Editor - Action being requested. */
	action?: string;

	/** Editor - Data being sent for create / edit / delete. */
	data?: object[];

	/** DataTables SSP - Draw counter. */
	draw?: number;

	/** DataTables SSP - paging start point. */
	start?: number;

	/** DataTables SSP - paging length. */
	length?: number;

	/** DataTables SSP - ordering. */
	order?: IDtOrder[];

	/** DataTables SSP - column information. */
	columns?: IDtColumn[];

	/** DataTables SSP - Global search value. */
	search?: {
		value: string;
	};

	/** Editor - Upload field name. */
	uploadField?: string;
}

/**
 * Response object for DataTables and Editor
 * @export
 */
export interface IDtResponse {
	/** DataTables - Array of row information. */
	data?: object[];

	/** Editor - Rows which have not been acted upon. */
	cancelled?: string[];

	/** DataTables and Editor - General error string. */
	error?: string;

	/** Editor - Field information errors. */
	fieldErrors?: IDtError[];

	/** Editor - `select`, `radio` and `checkbox` options. */
	options?: object;

	/** Editor - file information. */
	files?: object;

	/** DataTables SSP - draw counter. */
	draw?: number;

	/** DataTables SSP - number of records in the result set. */
	recordsTotal?: number;

	/** DataTables SSP - number of records after filtering. */
	recordsFiltered?: number;

	/** Editor - Upload complete file id. */
	upload?: {
		id: string
	};

	/** Debug information if enabled by Editor.debug() */
	debug?: any[];
}

/**
 * Global validation is performed when Editor submits a create, edit or
 * delete request. The function can be useful for cases where fields must
 * be validates together, rather than individually.
 */
export type IGlobalValidator =
	( editor: Editor, action: string, http: IDtRequest ) => Promise<true|string>;

/**
 * Server-side processing object structure
 * @interface ISSP
 * @private
 */
interface ISSP {
	draw?: number;
	recordsFiltered?: number;
	recordsTotal?: number;
}

/**
 * Left join object structure
 * @interface ILeftJoin
 * @private
 */
interface ILeftJoin {
	table: string;
	field1: string;
	field2: string;
	operator: string;
}

/**
 * DataTables Editor base class for creating editable tables.
 *
 * Editor class instances are capable of servicing all of the requests that
 * DataTables and Editor will make from the client-side - specifically:
 *
 * * Get data
 * * Create new record
 * * Edit existing record
 * * Delete existing records
 *
 * The Editor instance is configured with information regarding the
 * database table fields that you which to make editable, and other information
 * needed to read and write to the database (table name for example!).
 *
 * This documentation is very much focused on describing the API presented
 * by these DataTables Editor classes. For a more general overview of how
 * the Editor class is used, and how to install Editor on your server, please
 * refer to the {@link http://editor.datatables.net/manual Editor manual}.
 *
 * @export
 * @class Editor
 * @extends {NestedData}
 */
export default class Editor extends NestedData {
	public static Action = Action;

	public static version: string = '1.9.2';

	/**
	 * Determine the request type from an HTTP request.
	 *
	 * @static
	 * @param {IDtRequest} http HTTP request - normally `request.body`. Note that
	 *   if you are using `body-parser` you should use `{ extended: true }` as its
	 *   options to ensure that nested properties are correctly resolved.
	 * @returns {Action} Indicates what action the request is
	 */
	public static action( http: IDtRequest ): Action {
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
				throw new Error( 'Unknown Editor action: ' + http.action );
		}
	}

	private _db: knex;
	private _fields: Field[] = [];
	private _formData;
	private _processData;
	private _idPrefix: string = 'row_';
	private _join: Mjoin[] = [];
	private _pkey: string[] = ['id'];
	private _table: string[] = [];
	private _readTableNames: string[] = [];
	private _transaction: boolean = false;
	private _where = [];
	private _leftJoin: ILeftJoin[] = [];
	private _out: IDtResponse = {};
	private _events = [];
	private _validators: IGlobalValidator[] = [];
	private _tryCatch: boolean = false;
	private _knexTransaction: knex;
	private _uploadData: IUpload;
	private _debug: boolean = false;
	private _debugInfo: any[] = [];
	private _leftJoinRemove: boolean = false;
	private _schema: string = null;

	/**
	 * Creates an instance of Editor.
	 * @param {knex} [db=null] Database connection object
	 * @param {(string|string[])} [table=null] The table name in the database to
	 *   read and write information from and to. Can be given here or with the
	 *   'table' method.
	 * @param {(string|string[])} [pkey=null] Primary key column name in the
	 *   table given in
	 */
	constructor( db: knex = null, table: string|string[] = null, pkey: string|string[] = null ) {
		super();

		if ( db ) {
			this.db( db );
		}

		if ( table ) {
			this.table( table );
		}

		if ( pkey ) {
			this.pkey( pkey );
		}
	}

	/**
	 * Get the data constructed in this instance.
	 * @returns {IDtResponse} Data object
	 */
	public data(): IDtResponse {
		return this._out;
	}

	/**
	 * Get the database connection assigned to the instance.
	 * @returns {knex} Knex db interface
	 */
	public db(): knex;
	/**
	 * Set the database connection.
	 * @param {knex} Knex db interface
	 * @returns {Editor} Self for chaining
	 */
	public db(db: knex): Editor;
	public db(db?: knex): any {
		if ( db === undefined ) {
			if ( this._knexTransaction ) {
				return this._knexTransaction;
			}
			else if ( this._schema ) {
				return this._db.withSchema(this._schema);
			}
			else {
				return this._db;
			}
		}

		this._db = db;
		return this;
	}

	/**
	 * Get the debug setting for this instance
	 * @returns {boolean} Debug enabled (true) or not
	 */
	public debug(): boolean;
	/**
	 * Set the debug setting for this instance
	 * @param {boolean} set Debug flag
	 * @returns {Editor} Self for chaining
	 */
	public debug(set: boolean): Editor;
	/**
	 * Add a debug message
	 * @param {any} message Message to add
	 * @returns {Editor} Self for chaining
	 */
	public debug(message: any): Editor;
	public debug(param?: any): any {
		if ( param === undefined ) {
			return this._debug;
		}
		else if ( param === true || param === false ) {
			this._debug = param;
			return this;
		}

		// Otherwise its a message
		this._debugInfo.push( param );

		return this;
	}

	/**
	 * Add a new field to the Editor instance
	 * @param field Field instance to add=
	 * @returns {Editor} Editor instance
	 */
	public field( field: Field ): Editor;
	/**
	 * Get a field
	 * @param name Field name to get
	 * @returns {Field} Field instance
	 */
	public field( name: string ): Field;
	public field( nameOrField: any ): any {
		if ( typeof nameOrField === 'string' ) {
			for ( let i = 0, ien = this._fields.length; i < ien; i++ ) {
				if ( this._fields[i].name() === nameOrField ) {
					return this._fields[i];
				}
			}

			throw new Error( 'Unknown field: ' + nameOrField );
		}

		this._fields.push( nameOrField );
		return this;
	}

	/**
	 * Get the fields assigned to this instance.
	 * @returns {Field[]} Array of fields
	 */
	public fields(): Field[];
	/**
	 * Add one or more fields to the instance.
	 * @param {...Field[]} fields Fields to add
	 * @returns {Editor} Self for chaining
	 */
	public fields(...fields: Field[]): Editor;
	public fields(...fields: Field[]): any {
		if ( fields === undefined || fields.length === 0 ) {
			return this._fields;
		}

		this._fields.push.apply( this._fields, fields );

		return this;
	}

	/**
	 * Get the id prefix.
	 *
	 * Typically primary keys are numeric and this is not a valid ID value in an
	 * HTML document - is also increases the likelihood of an ID clash if multiple
	 * tables are used on a single page. As such, a prefix is assigned to the
	 * primary key value for each row, and this is used as the DOM ID, so Editor
	 * can track individual rows.
	 * @returns {string} id prefix
	 */
	public idPrefix(): string;
	/**
	 * Get the id prefix.
	 * @param {string} idPrefix Prefix to use.
	 * @returns {Editor} Self for chaining
	 */
	public idPrefix(idPrefix: string): Editor;
	public idPrefix(idPrefix?: string): any {
		if ( idPrefix === undefined ) {
			return this._idPrefix;
		}

		this._idPrefix = idPrefix;
		return this;
	}

	/**
	 * Get the data that is being processed by the Editor instance. This is only
	 * useful once the `process()` method has been called, and is available for
	 * use in validation and formatter methods.
	 * @returns {IDtRequest} Data that has been passed into {@link Editor.process()}
	 */
	public inData(): IDtRequest {
		return this._processData;
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
	 * @returns {Mjoin[]} Array of Mjoin instances
	 */
	public join(): Mjoin[];
	/**
	 * Add one or more Mjoin instances.
	 * @param {...Mjoin[]} join Mjoin instance to add.
	 * @returns {Editor} Self for chaining.
	 */
	public join(...join: Mjoin[]): Editor;
	public join(...join: Mjoin[]): any {
		if ( join === undefined || join.length === 0 ) {
			return this._join;
		}

		this._join.push.apply( this._join, join );

		return this;
	}

	/**
	 * Add a left join condition to the Editor instance, allowing it to operate
	 * over multiple tables. Multiple `leftJoin()` calls can be made for a
	 * single Editor instance to join multiple tables.
	 *
	 * A left join is the most common type of join that is used with Editor
	 * so this method is provided to make its use very easy to configure. Its
	 * parameters are basically the same as writing an SQL left join statement,
	 * but in this case Editor will handle the create, update and remove
	 * requirements of the join for you:
	 *
	 * * Create - On create Editor will insert the data into the primary table
	 *   and then into the joined tables - selecting the required data for each
	 *   table.
	 * * Edit - On edit Editor will update the main table, and then either
	 *   update the existing rows in the joined table that match the join and
	 *   edit conditions, or insert a new row into the joined table if required.
	 * * Remove - On delete Editor will remove the main row and then loop over
	 *   each of the joined tables and remove the joined data matching the join
	 *   link from the main table.
	 *
	 * Please note that when using join tables, Editor requires that you fully
	 * qualify each field with the field's table name. SQL can result table
	 * names for ambiguous field names, but for Editor to provide its full CRUD
	 * options, the table name must also be given. For example the field
	 * `first_name` in the table `users` would be given as `users.first_name`.
	 * @param {string} table Table name to do a join onto
	 * @param {string} field1 Field from the parent table to use as the join link
	 * @param {string} operator Join condition (`=`, '<`, etc)
	 * @param {string} field2 Field from the child table to use as the join link
	 * @returns {Editor} Self for chaining
	 */
	public leftJoin( table: string, field1: string, operator: string, field2: string ): Editor {
		this._leftJoin.push( {
			field1,
			field2,
			operator,
			table,
		} );

		return this;
	}

	/**
	 * Get the left join remove value.
	 * @returns {boolean} Value
	 */
	public leftJoinRemove(): boolean;
	/**
	 * Indicate if a remove should be performed on left joined tables when deleting
	 * from the parent row. Note that this is disabled by default and will be
	 * removed completely in v2. Use `ON DELETE CASCADE` in your database instead.
	 * @param {boolean} remove Value
	 * @returns {Editor} Self for chaining
	 */
	public leftJoinRemove(remove: boolean): Editor;
	public leftJoinRemove(remove?: boolean): any {
		if ( remove === undefined ) {
			return this._leftJoinRemove;
		}

		this._leftJoinRemove = remove;
		return this;
	}

	/**
	 * Add an event listener. The `Editor` class will trigger an number of
	 * events that some action can be taken on.
	 * @param {string} name Event name
	 * @param {Function} callback Event callback function that will be executed
	 *   when the event occurs.
	 * @returns {Editor} Self for chaining.
	 */
	public on( name: string, callback: Function ): Editor {
		if ( ! this._events[ name ] ) {
			this._events[ name ] = [];
		}

		this._events[ name ].push( callback );

		return this;
	}

	/**
	 * Get the database schema.
	 *
	 * This is used if you are using multiple schema's in your database. By default Editor
	 * will not specify a schema, so the default search path will be used. This allows that
	 * to be overridden.
	 * @returns {string} Schema
	 */
	public schema(): string;
	/**
	 * Set the database schema
	 * @param {string} schema Schema to use.
	 * @returns {Editor} Self for chaining
	 */
	public schema(schema: string): Editor;
	public schema(schema?: string): any {
		if ( schema === undefined ) {
			return this._schema;
		}

		this._schema = schema;
		return this;
	}

	/**
	 * Get CRUD read table name.
	 * @returns {string[]} Configured read table name
	 */
	public readTable(): string[];
	/**
	 * Set CRUD read table name. If this method is used, Editor will create from the
	 * table name(s) given rather than those given by `Editor->table()`. This can be
	 * a useful distinction to allow a read from a VIEW (which could make use of a
	 * complex SELECT) while writing to a different table.
	 * @param {(string|string[])} table Database table name to use for reading from
	 * @returns {Editor} Self for chaining
	 */
	public readTable(table: string|string[]): Editor;
	public readTable(table?: string|string[]): any {
		if ( table === undefined || table.length === 0 ) {
			return this._readTableNames;
		}

		if ( typeof table === 'string' ) {
			this._readTableNames.push( table );
		}
		else {
			this._readTableNames.push.apply( this._readTableNames, table );
		}

		return this;
	}

	/**
	 * Get the table name.
	 *
	 * The table name designated which DB table Editor will use as its data
	 * source for working with the database. Table names can be given with an
	 * alias, which can be used to simplify larger table names. The field
	 * names would also need to reflect the alias, just like an SQL query. For
	 * example: `users as a`.
	 * @returns {string[]} Configured table name
	 */
	public table(): string[];
	/**
	 * Set the table name.
	 * @param {(string|string[])} table Database table name to use
	 * @returns {Editor} Self for chaining
	 */
	public table(table: string|string[]): Editor;
	public table(table?: string|string[]): any {
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

	/**
	 * Get transaction support status
	 *
	 * When enabled (which it is by default) Editor will use an SQL transaction
	 * to ensure data integrity while it is performing operations on the table.
	 * This can be optionally disabled using this method, if required by your
	 * database configuration.
	 * @returns {boolean} true is transactions are enabled, false otherwise.
	 */
	public transaction(): boolean;
	/**
	 * Set transaction support state
	 * @param {boolean} transaction Set the transaction status
	 * @returns {Editor} Self for chaining
	 */
	public transaction(transaction: boolean): Editor;
	public transaction(transaction?: boolean): any {
		if ( transaction === undefined ) {
			return this._transaction;
		}

		this._transaction = transaction;
		return this;
	}

	/**
	 * Get the primary key value.
	 *
	 * The primary key must be known to Editor so it will know which rows are being
	 * edited / deleted upon those actions. The default value is ['id'].
	 * @returns {string[]} Array of column names
	 */
	public pkey(): string[];
	/**
	 * Set the primary key value(s)
	 * @param {string|string[]} [pkey] Primary key column name. Use an array of
	 *   strings if using a compound key.
	 * @returns {Editor} Self for chaining.
	 */
	public pkey(pkey: string|string[]): Editor;
	public pkey(pkey?: string|string[]): any {
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

	/**
	 * Convert a primary key array of field values to a combined value.
	 * @param {object} row The row of data that the primary key value should
	 *   be extracted from.
	 * @param {boolean} [flat=false] Flag to indicate if the given array is flat
	 *   (useful for `where` conditions) or nested for join tables.
	 * @returns {string} The created primary key value.
	 */
	public pkeyToValue( row: object, flat: boolean = false ): string {
		let pkey = this.pkey();
		let id = [];
		let val;

		for ( let i = 0, ien = pkey.length; i < ien; i++ ) {
			let column = pkey[i];

			if ( flat ) {
				val = row[ column ] !== undefined ?
					row[ column ] :
					null;
			}
			else {
				val = this._readProp( column, row );
			}

			if ( val === null ) {
				throw new Error( 'Primary key element is not available in the data set' );
			}

			// Postgres gives a `Date` object for timestamps which causes issues as
			// a value, so convert it to be a string. Could also be done with setTypeParser
			// https://github.com/brianc/node-postgres/issues/1200
			if ( val instanceof Date ) {
				val = val.toISOString();
			}

			id.push( val );
		}

		return id.join( this._pkeySeparator() );
	}

	/**
	 * Convert a primary key combined value to an array of field values.
	 * @param {string} value The id that should be split apart
	 * @param {boolean} [flat=false] Flag to indicate if the returned array should be
	 *   flat (useful for `where` conditions) or nested for join tables.
	 * @param {string[]} [pkey=null] The primary key name - will use the instance value
	 *   if not given
	 * @returns {object} Array of field values that the id was made up of
	 */
	public pkeyToObject( value: string, flat: boolean = false, pkey: string[] = null): object {
		let arr: object = {};

		value = value.replace( this.idPrefix(), '' );
		let idParts = value.split( this._pkeySeparator() );

		if ( pkey === null ) {
			pkey = this.pkey();
		}

		if ( pkey.length !== idParts.length ) {
			throw new Error( 'Primary key data does not match submitted data' );
		}

		for ( let i = 0, ien = idParts.length; i < ien; i++ ) {
			if ( flat ) {
				arr[ pkey[i] ] = idParts[i];
			}
			else {
				this._writeProp( arr, pkey[i], idParts[i] );
			}
		}

		return arr;
	}

	/**
	 * Process a request from the Editor client-side to get / set data.
	 * @param {IDtRequest} data Form data sent from the client-side -
	 *   e.g. `req.body`
	 * @param {IUpload} [files=null] File information, used for upload
	 *   requests - e.g. `req.files`
	 * @returns {Promise<Editor>} Promise that is fulfilled when Editor
	 *   has completed its processing - result is the Editor instance.
	 */
	public async process( data: IDtRequest, files: IUpload = null ): Promise<Editor> {
		let that = this;
		let run = async function() {
			if ( that._tryCatch ) {
				try {
					await that._process( data, files );
				} catch ( e ) {
					that._out.error = e.message;
					// knex does the rollback if an exception occurs
				}
			}
			else {
				await that._process( data, files );
			}
		};

		if ( this._transaction ) {
			await this._db.transaction( async function(trx) {
				that._knexTransaction = trx;
				await run();
				that._knexTransaction = null;
			} );
		}
		else {
			await run();
		}

		return this;
	}

	/**
	 * Get the try/catch status.
	 *
	 * Editor uses a try/catch in the {@link Editor.process} method, and it can be
	 * useful to disable this for debugging, but its not recommended you do that
	 * in production.
	 * @returns {boolean} Try / catch status.
	 */
	public tryCatch(): boolean;
	/**
	 * Set the try/catch state.
	 * @param {boolean} tryCatch Value to set. `true` will enable, `false` disable.
	 * @returns {Editor} Self for chaining.
	 */
	public tryCatch(tryCatch: boolean): Editor;
	public tryCatch(tryCatch?: boolean): any {
		if ( tryCatch === undefined ) {
			return this._tryCatch;
		}

		this._tryCatch = tryCatch;
		return this;
	}

	/**
	 * Perform validation on a data set.
	 *
	 * Note that validation is performed on data only when the action is
	 * `create` or `edit`. Additionally, validation is performed on the _wire
	 * data_ - i.e. that which is submitted from the client, without formatting.
	 * Any formatting required by `setFormatter` is performed after the data
	 * from the client has been validated.
	 * @param {IDtError[]} errors Output array to which field error information will
	 *   be written. Each element in the array represents a field in an error
	 *   condition. These elements are themselves arrays with two properties
	 *   set; `name` and `status`.
	 * @param {IDtRequest} http The format data to check
	 * @returns {Promise<boolean>} `true` if the data is valid, `false` if not.
	 */
	public async validate( errors: IDtError[], http: IDtRequest ): Promise<boolean> {
		if ( http.action !== 'create' && http.action !== 'edit' ) {
			return true;
		}

		let keys = Object.keys( http.data );
		let fields = this.fields();
		let idPrefix = this.idPrefix();

		for ( let i = 0, ien = keys.length; i < ien; i++ ) {
			let values = http.data[ keys[i] ];

			for ( let j = 0, jen = fields.length; j < jen; j++ ) {
				let field = fields[j];
				let validation = await field.validate( values, this, keys[i].replace( idPrefix, '' ) );

				if ( validation !== true ) {
					errors.push( {
						name: field.name(),
						status: validation,
					} );
				}
			}

			// MJoin validation
			for ( let j = 0, jen = this._join.length; j < jen; j++ ) {
				await this._join[j].validate( errors, this, values, http.action );
			}
		}

		return errors.length > 0 ?
			false :
			true;
	}

	/**
	 * Get any global validator that has been set.
	 * @returns {IGlobalValidator[]} Global validator
	 */
	public validator(): IGlobalValidator[];
	/**
	 * Set a global validator. This will be triggered for the create, edit
	 * and remove actions performed from the client-side.
	 * @param {IGlobalValidator} fn Function to execute when validating the input data.
	 * @returns {Editor} Self for chaining
	 */
	public validator(fn: IGlobalValidator): Editor;
	public validator(fn?: IGlobalValidator): any {
		if ( fn === undefined ) {
			return this._validators;
		}

		this._validators.push( fn );
		return this;
	}

	/**
	 * Get the array of conditions applied to the method.
	 * @returns {any[]} Knex where conditions.
	 */
	public where(): any[];
	/**
	 * Set a condition for the queries Editor will perform. Editor uses Knex
	 * to connect to the database, and exposes the knex object using this method
	 * so you can add any conditions you like that are supported by Knex.
	 * @param {*} cond Knex query condition
	 * @returns {Editor} Self for chaining.
	 */
	public where(...cond: any[]): Editor;
	public where(...cond: any[]): any {
		if ( cond.length === 0 ) {
			return this._where;
		}

		this._where.push( ...cond );

		return this;
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	private async _fileClean(): Promise<void> {
		let that = this;
		let run = async function( fields ) {
			for ( let i = 0, ien = fields.length; i < ien; i++ ) {
				let upload = fields[i].upload();

				if ( upload ) {
					await upload.dbCleanExec( that, fields[i] );
				}
			}
		};

		await run( this._fields );

		for ( let i = 0, ien = this._join.length; i < ien; i++ ) {
			await run( this._join[i].fields() );
		}
	}

	private async _fileData( limitTable: string = null, ids: string[] = null, data: any[] = null ): Promise<object> {
		let files = {};

		// The fields in this instance
		await this._fileDataFields( files, this._fields, limitTable, ids, data );

		// From joined tables
		for ( let i = 0, ien = this._join.length; i < ien; i++ ) {
			let joinData = null;

			// If we have data from the get, it is nested from the join, so we need to
			// un-nest it (i.e. get the array of joined data for each row)
			if ( data ) {
				joinData = [];

				for ( let j = 0, jen = data.length; j < jen ; j++ ) {
					let innerData = data[j][this._join[i].name()];

					if ( innerData ) {
						joinData.push.apply( joinData, innerData );
					}
				}
			}

			await this._fileDataFields( files, this._join[i].fields(), limitTable, ids, joinData );
		}

		return files;
	}

	private async _fileDataFields(
		files: object, fields: Field[], limitTable: string, ids: string[] = null, data: any[] = null
	): Promise<void> {
		for ( let i = 0, ien = fields.length; i < ien; i++ ) {
			let upload = fields[i].upload();

			if ( upload ) {
				let table = upload.table();

				if ( ! table ) {
					continue;
				}

				if ( limitTable !== null && table !== limitTable ) {
					continue;
				}

				if ( files[ table ] ) {
					continue;
				}

				// Make a collection of the ids used in this data set to get a limited data set
				// in return (security and performance)
				if ( ids === null ) {
					ids = [];
				}

				if ( data !== null ) {
					for ( let j = 0, jen = data.length; j < jen; j++ ) {
						let val = fields[i].val('set', data[j]);

						if ( val ) {
							ids.push( val );
						}
					}

					if ( ids.length === 0 ) {
						// If no data to fetch, then don't bother
						return;
					}
					else if ( ids.length > 1000 ) {
						// Don't use WHERE IN for really large arrays
						ids = null;
					}
				}

				let fileData = await upload.data( this.db(), ids );

				if ( fileData ) {
					files[ table ] = fileData;
				}
			}
		}
	}

	private _findField( name: string, type: 'db'|'name' ): Field {
		let fields = this._fields;

		for ( let i = 0, ien = fields.length; i < ien; i++ ) {
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

	private async _get( id: string, http: object = null ): Promise<IDtResponse> {
		let cancel = await this._trigger( 'preGet', id );
		if ( cancel === false ) {
			return {};
		}

		let fields = this.fields();
		let pkeys = this.pkey();
		let query = this.db().table( this._readTable()[0] );
		let options = {};

		for ( let i = 0, ien = pkeys.length; i < ien; i++ ) {
			query.select( pkeys[i] + ' as ' + pkeys[i] );
		}

		for ( let i = 0, ien = fields.length; i < ien; i++ ) {
			if ( pkeys.includes( fields[i].dbField() ) ) {
				continue;
			}

			if ( fields[i].apply('get') && fields[i].getValue() === undefined ) {
				// Use the `as` to ensure that the table name is included, if using a join
				let dbField = fields[i].dbField();

				if ( dbField.indexOf( '(') === -1 ) {
					query.select( dbField + ' as ' + dbField );
				}
				else {
					query.select( this.db().raw(dbField + ' as "' + dbField + '"') );
				}
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
			throw new Error( 'Error executing SQL for data get. Enable SQL debug using ' +
				'`debug: true` in your Knex db configuration'
			);
		}

		let out = [];
		for ( let i = 0, ien = result.length; i < ien; i++ ) {
			let inner = {
				DT_RowId: this.idPrefix() + this.pkeyToValue( result[i], true )
			};

			for ( let j = 0, jen = fields.length; j < jen; j++ ) {
				if ( fields[j].apply('get') ) {
					fields[j].write( inner, result[i] );
				}
			}

			out.push( inner );
		}

		// Field options
		if ( id === null ) {
			for ( let i = 0, ien = fields.length; i < ien; i++ ) {
				let opts = await fields[i].optionsExec( this.db() );

				if ( opts ) {
					options[ fields[i].name() ] = opts;
				}
			}
		}

		// Build a DtResponse object
		let response = {
			data: out,
			draw: ssp.draw,
			files: {},
			options,
			recordsFiltered: ssp.recordsFiltered,
			recordsTotal: ssp.recordsTotal
		};

		// Row based joins
		for ( let i = 0, ien = this._join.length; i < ien; i++ ) {
			await this._join[i].data( this, response );
		}

		response.files = await this._fileData( null, null, response.data );

		await this._trigger( 'postGet', id, out );

		return response;
	}

	private _getWhere( query: knex.QueryBuilder ): void {
		let where = this.where();

		for ( let i = 0, ien = where.length; i < ien; i++ ) {
			query.where( where[i] );
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

		if ( id === null ) {
			return null;
		}

		// Was the primary key altered as part of the edit, if so use the
		// submitted values
		id = this._pkey.length > 1 ?
			this.pkeyToValue( values ) :
			this._pkeySubmitMerge( id, values );

		// Join
		for ( let i = 0, ien = this._join.length; i < ien; i++ ) {
			await this._join[i].create( this, id, values );
		}

		await this._trigger( 'writeCreate', id, values );

		let row = await this._get( id );
		row = row.data.length > 0 ?
			row.data[0] :
			null;

		await this._trigger( 'postCreate', id, values, row );

		return row;
	}

	private async _insertOrUpdate( id: string, values: object ): Promise<string> {
		// Loop over the tables, doing the insert or update as needed
		let tables = this.table();

		for ( let i = 0, ien = tables.length; i < ien; i++ ) {
			let res = await this._insertOrUpdateTable(
				tables[i],
				values,
				id !== null ?
					this.pkeyToObject( id, true ) :
					null
			);

			// If you don't have an id yet, then the first insert will return
			// the id we want
			if ( res !== null && id === null ) {
				id = res;
			}
		}

		// And for the left join tables
		for ( let i = 0, ien = this._leftJoin.length; i < ien; i++ ) {
			let join = this._leftJoin[i];

			// Which side of the join refers to the parent table?
			let joinTable = this._alias( join.table, 'alias' );
			let tablePart = this._part( join.field1 );
			let parentLink;
			let childLink;
			let whereVal;

			if ( this._part( join.field1, 'db' ) ) {
				tablePart = this._part( join.field1, 'db' ) + '.' + tablePart;
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

				if ( ! field || ! field.apply( 'edit', values ) ) {
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

			await this._insertOrUpdateTable(
				join.table,
				values,
				{ [whereName]: whereVal }
			);
		}

		return id;
	}

	private async _insertOrUpdateTable( table: string, values: object, where: object = null ) {
		let set = {};
		let res;
		let action: 'create'|'edit' = (where === null) ? 'create' : 'edit';
		let tableAlias = this._alias( table, 'alias' );
		let fields = this.fields();

		for ( let i = 0, ien = fields.length; i < ien; i++ ) {
			let field = fields[i];
			let tablePart = this._part( field.dbField() );

			if ( this._part( field.dbField(), 'db' ) ) {
				tablePart = this._part( field.dbField(), 'db' ) + '.' + tablePart;
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

			// Some database's (specifically pg) don't like having the table
			// name prefixing the column name.
			let fieldPart = this._part( field.dbField(), 'column' );
			set[ fieldPart ] = field.val( 'set', values );
		}

		if ( Object.keys(set).length === 0 ) {
			return null;
		}

		if ( action === 'create' && this.table().indexOf(table) !== -1 ) {
			// On the main table we get the pkey that is generated
			let pkey = this._part( this._pkey[0], 'column' );
			res = await this
				.db()
				.insert( set )
				.table( table )
				.returning( pkey );

			return typeof res[0] === 'object' ?
				res[0][pkey].toString() :
				res[0].toString();
		}
		else if ( action === 'create' ) {
			// Create on a linked table
			res = await this
				.db()
				.insert( set )
				.table( table );
		}
		else if ( this.table().indexOf(table) === -1 ) {
			// Update on a linked table - the record might not yet exist, so need to check.
			let check = await this
				.db()
				.table( table )
				.select('*')
				.where( where );

			if ( check && check.length ) {
				await this
					.db()
					.table( table )
					.update( set )
					.where( where );
			}
			else {
				await this
					.db()
					.table( table )
					.insert( Object.assign( {}, set, where ) );
			}
		}
		else {
			// Update on the host table
			await this
				.db()
				.table( table )
				.update( set )
				.where( where );
		}
	}

	private _alias( name: string, type: 'alias'|'orig' = 'alias'): string {
		if ( name.indexOf( ' as ' ) !== -1 ) {
			let a = name.split(/ as /i);
			return type === 'alias' ?
				a[1] :
				a[0];
		}

		if ( name.indexOf( ' ' ) !== -1 ) {
			let a = name.split(/ /i);
			return type === 'alias' ?
				a[1] :
				a[0];
		}

		return name;
	}

	private _part( name: string, type: 'table'|'db'|'column' = 'table'): string {
		let db;
		let table;
		let column;

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

	private _prepJoin(): void {
		if ( this._leftJoin.length === 0 ) {
			return;
		}

		// Check if the primary key has a table identifier - if not - add one
		for ( let i = 0, ien = this._pkey.length; i < ien; i++ ) {
			let val = this._pkey[i];

			if ( val.indexOf('.') === -1 ) {
				this._pkey[i] = this._alias( this.table()[0], 'alias' ) + '.' + val;
			}
		}

		// Check that all fields have a table selector, otherwise, we'd need to
		// know the structure of the tables, to know which fields belong in
		// which. This extra requirement on the fields removes that
		for ( let i = 0, ien = this._fields.length; i < ien; i++ ) {
			let field = this._fields[i];
			let name = field.dbField();

			if ( name.indexOf('.') === -1 ) {
				throw new Error( 'Table part of the field "' + name + '" was not found. ' +
					'In Editor instances that use a join, all fields must have the ' +
					'database table set explicitly.'
				);
			}
		}
	}

	private _performLeftJoin( query: knex.QueryBuilder ): void {
		for ( let i = 0, ien = this._leftJoin.length; i < ien; i++ ) {
			let join = this._leftJoin[i];

			query.leftJoin( join.table, function() {
				this.on( join.field1, join.operator, join.field2 );
			} );
		}
	}

	private _pkeySeparator(): string {
		let str = this.pkey().join(',');

		return crc.crc32( str ).toString(16);
	}

	private _pkeySubmitMerge( pkeyVal: string, row: object ): string {
		let pkey = this._pkey;
		let arr = this.pkeyToObject( pkeyVal, true );

		for ( let i = 0, ien = pkey.length; i < ien; i++ ) {
			let column = pkey[ i ];
			let field = this._findField( column, 'db' );

			if ( field && field.apply( 'edit', row ) ) {
				arr[ column ] = field.val( 'set', row );
			}
		}

		return this.pkeyToValue( arr, true );
	}

	private _pkeyValidateInsert( row: object ): boolean {
		let pkey = this.pkey();

		if ( pkey.length === 1 ) {
			return true;
		}

		for ( let i = 0, ien = pkey.length; i < ien; i++ ) {
			let column = pkey[i];
			let field = this._findField( column, 'db' );

			if ( ! field || ! field.apply('create', row) ) {
				throw new Error( 'When inserting into a compound key table, ' +
					'all fields that are part of the compound key must be ' +
					'submitted with a specific value.'
				);
			}
		}

		return true;
	}

	private async _process( data: IDtRequest, upload: IUpload ): Promise<void> {
		this._out = {
			cancelled: [],
			data: [],
			fieldErrors: []
		};

		this._processData = data;
		this._uploadData = upload;
		this._formData = data.data ? data.data : null;
		this._prepJoin();

		for (let validator of this._validators) {
			let ret = await validator( this, data.action, data );

			if ( typeof ret === 'string' ) {
				this._out.error = ret;
				break;
			}
		}

		if ( data.action && data.action !== 'upload' && ! data.data ) {
			this._out.error = 'No data detected. Have you used `{extended: true}` for `bodyParser`?';
		}

		let action = Editor.action(data);

		if ( ! this._out.error ) {
			if ( action === Action.Read ) {
				let outData = await this._get( null, data );

				this._out.data = outData.data;
				this._out.draw = outData.draw;
				this._out.files = outData.files;
				this._out.options = outData.options;
				this._out.recordsTotal = outData.recordsTotal;
				this._out.recordsFiltered = outData.recordsFiltered;
			}
			else if ( action === Action.Upload ) {
				await this._upload( data );
			}
			else if ( action === Action.Delete ) {
				await this._remove( data );
				await this._fileClean();
			}
			else if ( action === Action.Create || action === Action.Edit ) {
				// create or edit
				let keys = Object.keys( data.data );

				// Pre events so they can occur before validation, and they
				// all happen together
				for ( let i = 0, ien = keys.length; i < ien; i++ ) {
					let cancel = null;
					let idSrc = keys[i];
					let values = data.data[keys[i]];

					if ( action === Action.Create ) {
						cancel = await this._trigger( 'preCreate', values );
					}
					else {
						let id = idSrc.replace( this.idPrefix(), '' );
						cancel = await this._trigger( 'preEdit', id, values );
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

					for ( let i = 0, ien = keys.length; i < ien; i++ ) {
						let d = action === Action.Create ?
							await this._insert( data.data[keys[i]] ) :
							await this._update( keys[i], data.data[keys[i]] );

						if ( d !== null ) {
							this._out.data.push( d );
						}
					}

					await this._fileClean();
				}
			}
		}

		if ( this._debug ) {
			this._out.debug = this._debugInfo.slice();
		}
	}

	private _readTable(): string[] {
		return this._readTableNames.length ?
			this._readTableNames :
			this._table;
	}

	private async _remove( http: IDtRequest ): Promise<void> {
		let ids: string[] = [];
		let keys = Object.keys( http.data );

		for ( let i = 0, ien = keys.length; i < ien; i++ ) {
			// Strip the ID prefix that the client-side sends back
			let id = keys[i].replace( this.idPrefix(), '' );

			let res = await this._trigger( 'preRemove', id, http.data[keys[i]] );

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
		for ( let i = 0, ien = this._join.length; i < ien; i++ ) {
			await this._join[i].remove( this, ids );
		}

		// Remove from the left join tables
		if ( this._leftJoinRemove ) {
			for ( let i = 0, ien = this._leftJoin.length; i < ien; i++ ) {
				let join = this._leftJoin[i];
				let table = this._alias( join.table, 'orig' );
				let parentLink;
				let childLink;

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
					await this._removeTable( join.table, ids, [childLink] );
				}
			}
		}

		// Remove from the primary tables
		let tables = this.table();

		for ( let i = 0, ien = tables.length; i < ien; i++ ) {
			await this._removeTable( tables[i], ids );
		}

		for ( let i = 0, ien = ids.length; i < ien; i++ ) {
			await this._trigger( 'postRemove', ids[i], http.data[ this.idPrefix() + ids[i] ] );
		}
	}

	private async _removeTable( table: string, ids: string[], pkey: string[] = null ): Promise<void> {
		if ( pkey === null ) {
			pkey = this.pkey();
		}

		// Check that there is actually a field which has a set option for this table
		let count = 0;
		let fields = this.fields();
		let tableAlias = this._alias(table, 'alias');

		for ( let i = 0, ien = fields.length; i < ien; i++ ) {
			let dbField = fields[i].dbField();

			if ( dbField.indexOf('.') === -1 ||
				(this._part( dbField, 'table') === tableAlias && fields[i].set() !== SetType.None)
			) {
				count++;
			}
		}

		if ( count > 0 ) {
			let q = this.db().from( this._alias(table, 'orig') );

			for ( let i = 0, ien = ids.length; i < ien; i++ ) {
				let cond = this.pkeyToObject( ids[i], true, pkey );

				q.orWhere( function() {
					this.where( cond );
				} );
			}

			await q.del();
		}
	}

	private async _ssp( query: knex.QueryBuilder, http: IDtRequest ): Promise<ISSP> {
		if ( ! http || ! http.draw ) {
			return {};
		}

		// Add the server-side processing conditions to the get query
		this._sspLimit( query, http );
		this._sspSort( query, http );
		this._sspFilter( query, http );

		// Get the number of rows in the result set
		let setCount = this
			.db()
			.from( this._readTable()[0] )
			.count( this._pkey[0] + ' as cnt' );

		this._getWhere( setCount );
		this._sspFilter( setCount, http );
		this._performLeftJoin( setCount );

		let res = await setCount;
		let recordsFiltered = (res[0] as any).cnt;

		// Get the number of rows in the full set
		let fullCount = this
			.db()
			.from( this._readTable()[0] )
			.count( this._pkey[0] + ' as cnt' );

		this._getWhere( fullCount );
		if ( this._where.length  ) { // only needed if there is a where condition
			this._performLeftJoin( fullCount );
		}
		res = await fullCount;
		let recordsTotal = (res[0] as any).cnt;

		return {
			draw: http.draw * 1,
			recordsFiltered,
			recordsTotal
		};
	}

	private _sspField( http: IDtRequest, index: number ): string {
		let name = http.columns[ index ].data;
		let field = this._findField( name, 'name' );

		if ( ! field ) {
			// Is it the primary key?
			if ( name === 'DT_RowId' ) {
				return this._pkey[0];
			}

			throw new Error( 'Unknown field: ' + name + ' (index ' + index + ')' );
		}

		return field.dbField();
	}

	private _sspFilter( query: knex.QueryBuilder, http: IDtRequest ): void {
		let fields = this.fields();

		// Global filter
		if ( http.search.value ) {
			query.where( (q) => {
				for ( let i = 0, ien = http.columns.length; i < ien; i++ ) {
					if ( http.columns[i].searchable.toString() === 'true' ) {
						let field = this._sspField( http, i );

						if ( field ) {
							// Nasty hack for Postgres
							if ( this._db.client.config.client === 'psql' ) {
								q.orWhere( field+'::text', 'ILIKE', '%' + http.search.value + '%' );
							}
							else {
								q.orWhere( field, 'LIKE', '%' + http.search.value + '%' );
							}
						}
					}
				}
			} );
		}

		// Column filter
		for ( let i = 0, ien = http.columns.length; i < ien; i++ ) {
			let column = http.columns[i];
			let search = column.search.value;

			if ( search !== '' && column.searchable.toString() === 'true' ) {
				// Nasty hack for Postgres
				if ( this._db.client.config.client === 'psql' ) {
					query.where(
						this._sspField( http, i )+'::text',
						'ILIKE',
						'%' + search + '%'
					);
				}
				else {
					query.where(
						this._sspField( http, i ),
						'LIKE',
						'%' + search + '%'
					);
				}
			}
		}
	}

	private _sspLimit( query: knex.QueryBuilder, http: IDtRequest ): void {
		if ( http.length !== -1 ) { // -1 is 'show all' in DataTables
			query
				.limit( http.length * 1 )
				.offset( http.start * 1 );
		}
	}

	private _sspSort( query: knex.QueryBuilder, http: IDtRequest ): void {
		for ( let i = 0, ien = http.order.length; i < ien; i++ ) {
			let order = http.order[i];

			query.orderBy(
				this._sspField( http, order.column ),
				order.dir === 'asc' ? 'asc' : 'desc'
			);
		}
	}

	private async _trigger( name: string, ...args ): Promise<boolean> {
		let out = null;
		let events = this._events[ name ];

		if ( ! this._events[ name ] ) {
			return;
		}

		args.unshift( this );

		for ( let i = 0, ien = events.length; i < ien; i++ ) {
			let res = await events[i].apply( this, args );

			if ( res !== null ) {
				out = res;
			}
		}

		return out;
	}

	private async _update( id: string, values: object ): Promise<object> {
		id = id.replace( this.idPrefix(), '' );

		// Update or insert the rows for the parent table and the left joined
		// tables
		await this._insertOrUpdate( id, values );

		// Join
		for ( let i = 0, ien = this._join.length; i < ien; i++ ) {
			await this._join[i].update( this, id, values );
		}

		// Was the primary key altered as part of the edit, if so use the
		// submitted values
		let getId = this._pkeySubmitMerge( id, values );

		await this._trigger( 'writeEdit', id, values );

		let row = await this._get( getId );
		row = row.data.length > 0 ?
			row.data[0] :
			null;

		await this._trigger( 'postEdit', id, values, row );

		return row;
	}

	private async _upload( http: IDtRequest ): Promise<void> {
		// Search for the upload field in the local fields
		let field = this._findField( http.uploadField, 'name' );
		let fieldName = '';

		if ( ! field ) {
			// Perhaps it is in a join instance
			for ( let i = 0, ien = this._join.length; i < ien; i++ ) {
				let join = this._join[i];
				let fields = join.fields();

				for ( let j = 0, jen = fields.length; j < jen; j++ ) {
					let joinField = fields[j];
					let name = join.name() + '[].' + joinField.name();

					if ( name === http.uploadField ) {
						field = joinField;
						fieldName = name;
					}
				}
			}
		}
		else {
			fieldName = field.name();
		}

		if ( ! this._uploadData ) {
			throw new Error( 'No upload data supplied' );
		}

		if ( ! field ) {
			throw new Error( 'Unknown upload field name submitted' );
		}

		let eventRes = await this._trigger( 'preUpload', http );

		// Allow the upload to be cancelled by an event handler
		if ( eventRes === false ) {
			return;
		}

		let upload = field.upload();
		if ( ! upload ) {
			throw new Error( 'File uploaded to a field that does not have upload options configured' );
		}

		let res = await upload.exec( this, this._uploadData );

		if ( ! res ) {
			this._out.fieldErrors.push( {
				name: fieldName,
				status: upload.error()
			} );
		}
		else {
			let files = await this._fileData( upload.table(), [res] );

			this._out.files = files;
			this._out.upload = {
				id: res
			};
		}
	}
}
