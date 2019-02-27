import * as knex from 'knex';
import Field from './field';
import Mjoin from './mjoin';
import NestedData from './nestedData';
import { IUpload } from './upload';
/**
 * Action that has been requested by the client-side
 * (based on the `action` parameter).
 * @export
 */
export declare enum Action {
    /** Get data (used by DataTables). */
    Read = 0,
    /** Create a new row. */
    Create = 1,
    /** Edit one or more rows. */
    Edit = 2,
    /** Delete one or more rows. */
    Delete = 3,
    /** Upload a file. */
    Upload = 4
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
    dir: 'asc' | 'desc';
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
        id: string;
    };
    /** Debug information if enabled by Editor.debug() */
    debug?: any[];
}
/**
 * Global validation is performed when Editor submits a create, edit or
 * delete request. The function can be useful for cases where fields must
 * be validates together, rather than individually.
 */
export declare type IGlobalValidator = (editor: Editor, action: string, http: IDtRequest) => Promise<true | string>;
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
    static Action: typeof Action;
    static version: string;
    /**
     * Determine the request type from an HTTP request.
     *
     * @static
     * @param {IDtRequest} http HTTP request - normally `request.body`. Note that
     *   if you are using `body-parser` you should use `{ extended: true }` as its
     *   options to ensure that nested properties are correctly resolved.
     * @returns {Action} Indicates what action the request is
     */
    static action(http: IDtRequest): Action;
    private _db;
    private _fields;
    private _formData;
    private _processData;
    private _idPrefix;
    private _join;
    private _pkey;
    private _table;
    private _readTableNames;
    private _transaction;
    private _where;
    private _leftJoin;
    private _out;
    private _events;
    private _validators;
    private _tryCatch;
    private _knexTransaction;
    private _uploadData;
    private _debug;
    private _debugInfo;
    private _leftJoinRemove;
    private _schema;
    /**
     * Creates an instance of Editor.
     * @param {knex} [db=null] Database connection object
     * @param {(string|string[])} [table=null] The table name in the database to
     *   read and write information from and to. Can be given here or with the
     *   'table' method.
     * @param {(string|string[])} [pkey=null] Primary key column name in the
     *   table given in
     */
    constructor(db?: knex, table?: string | string[], pkey?: string | string[]);
    /**
     * Get the data constructed in this instance.
     * @returns {IDtResponse} Data object
     */
    data(): IDtResponse;
    /**
     * Get the database connection assigned to the instance.
     * @returns {knex} Knex db interface
     */
    db(): knex;
    /**
     * Set the database connection.
     * @param {knex} Knex db interface
     * @returns {Editor} Self for chaining
     */
    db(db: knex): Editor;
    /**
     * Get the debug setting for this instance
     * @returns {boolean} Debug enabled (true) or not
     */
    debug(): boolean;
    /**
     * Set the debug setting for this instance
     * @param {boolean} set Debug flag
     * @returns {Editor} Self for chaining
     */
    debug(set: boolean): Editor;
    /**
     * Add a debug message
     * @param {any} message Message to add
     * @returns {Editor} Self for chaining
     */
    debug(message: any): Editor;
    /**
     * Add a new field to the Editor instance
     * @param field Field instance to add=
     * @returns {Editor} Editor instance
     */
    field(field: Field): Editor;
    /**
     * Get a field
     * @param name Field name to get
     * @returns {Field} Field instance
     */
    field(name: string): Field;
    /**
     * Get the fields assigned to this instance.
     * @returns {Field[]} Array of fields
     */
    fields(): Field[];
    /**
     * Add one or more fields to the instance.
     * @param {...Field[]} fields Fields to add
     * @returns {Editor} Self for chaining
     */
    fields(...fields: Field[]): Editor;
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
    idPrefix(): string;
    /**
     * Get the id prefix.
     * @param {string} idPrefix Prefix to use.
     * @returns {Editor} Self for chaining
     */
    idPrefix(idPrefix: string): Editor;
    /**
     * Get the data that is being processed by the Editor instance. This is only
     * useful once the `process()` method has been called, and is available for
     * use in validation and formatter methods.
     * @returns {IDtRequest} Data that has been passed into {@link Editor.process()}
     */
    inData(): IDtRequest;
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
    join(): Mjoin[];
    /**
     * Add one or more Mjoin instances.
     * @param {...Mjoin[]} join Mjoin instance to add.
     * @returns {Editor} Self for chaining.
     */
    join(...join: Mjoin[]): Editor;
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
    leftJoin(table: string, field1: string, operator: string, field2: string): Editor;
    /**
     * Get the left join remove value.
     * @returns {boolean} Value
     */
    leftJoinRemove(): boolean;
    /**
     * Indicate if a remove should be performed on left joined tables when deleting
     * from the parent row. Note that this is disabled by default and will be
     * removed completely in v2. Use `ON DELETE CASCADE` in your database instead.
     * @param {boolean} remove Value
     * @returns {Editor} Self for chaining
     */
    leftJoinRemove(remove: boolean): Editor;
    /**
     * Add an event listener. The `Editor` class will trigger an number of
     * events that some action can be taken on.
     * @param {string} name Event name
     * @param {Function} callback Event callback function that will be executed
     *   when the event occurs.
     * @returns {Editor} Self for chaining.
     */
    on(name: string, callback: Function): Editor;
    /**
     * Get the database schema.
     *
     * This is used if you are using multiple schema's in your database. By default Editor
     * will not specify a schema, so the default search path will be used. This allows that
     * to be overridden.
     * @returns {string} Schema
     */
    schema(): string;
    /**
     * Set the database schema
     * @param {string} schema Schema to use.
     * @returns {Editor} Self for chaining
     */
    schema(schema: string): Editor;
    /**
     * Get CRUD read table name.
     * @returns {string[]} Configured read table name
     */
    readTable(): string[];
    /**
     * Set CRUD read table name. If this method is used, Editor will create from the
     * table name(s) given rather than those given by `Editor->table()`. This can be
     * a useful distinction to allow a read from a VIEW (which could make use of a
     * complex SELECT) while writing to a different table.
     * @param {(string|string[])} table Database table name to use for reading from
     * @returns {Editor} Self for chaining
     */
    readTable(table: string | string[]): Editor;
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
    table(): string[];
    /**
     * Set the table name.
     * @param {(string|string[])} table Database table name to use
     * @returns {Editor} Self for chaining
     */
    table(table: string | string[]): Editor;
    /**
     * Get transaction support status
     *
     * When enabled (which it is by default) Editor will use an SQL transaction
     * to ensure data integrity while it is performing operations on the table.
     * This can be optionally disabled using this method, if required by your
     * database configuration.
     * @returns {boolean} true is transactions are enabled, false otherwise.
     */
    transaction(): boolean;
    /**
     * Set transaction support state
     * @param {boolean} transaction Set the transaction status
     * @returns {Editor} Self for chaining
     */
    transaction(transaction: boolean): Editor;
    /**
     * Get the primary key value.
     *
     * The primary key must be known to Editor so it will know which rows are being
     * edited / deleted upon those actions. The default value is ['id'].
     * @returns {string[]} Array of column names
     */
    pkey(): string[];
    /**
     * Set the primary key value(s)
     * @param {string|string[]} [pkey] Primary key column name. Use an array of
     *   strings if using a compound key.
     * @returns {Editor} Self for chaining.
     */
    pkey(pkey: string | string[]): Editor;
    /**
     * Convert a primary key array of field values to a combined value.
     * @param {object} row The row of data that the primary key value should
     *   be extracted from.
     * @param {boolean} [flat=false] Flag to indicate if the given array is flat
     *   (useful for `where` conditions) or nested for join tables.
     * @returns {string} The created primary key value.
     */
    pkeyToValue(row: object, flat?: boolean): string;
    /**
     * Convert a primary key combined value to an array of field values.
     * @param {string} value The id that should be split apart
     * @param {boolean} [flat=false] Flag to indicate if the returned array should be
     *   flat (useful for `where` conditions) or nested for join tables.
     * @param {string[]} [pkey=null] The primary key name - will use the instance value
     *   if not given
     * @returns {object} Array of field values that the id was made up of
     */
    pkeyToObject(value: string, flat?: boolean, pkey?: string[]): object;
    /**
     * Process a request from the Editor client-side to get / set data.
     * @param {IDtRequest} data Form data sent from the client-side -
     *   e.g. `req.body`
     * @param {IUpload} [files=null] File information, used for upload
     *   requests - e.g. `req.files`
     * @returns {Promise<Editor>} Promise that is fulfilled when Editor
     *   has completed its processing - result is the Editor instance.
     */
    process(data: IDtRequest, files?: IUpload): Promise<Editor>;
    /**
     * Get the try/catch status.
     *
     * Editor uses a try/catch in the {@link Editor.process} method, and it can be
     * useful to disable this for debugging, but its not recommended you do that
     * in production.
     * @returns {boolean} Try / catch status.
     */
    tryCatch(): boolean;
    /**
     * Set the try/catch state.
     * @param {boolean} tryCatch Value to set. `true` will enable, `false` disable.
     * @returns {Editor} Self for chaining.
     */
    tryCatch(tryCatch: boolean): Editor;
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
    validate(errors: IDtError[], http: IDtRequest): Promise<boolean>;
    /**
     * Get any global validator that has been set.
     * @returns {IGlobalValidator[]} Global validator
     */
    validator(): IGlobalValidator[];
    /**
     * Set a global validator. This will be triggered for the create, edit
     * and remove actions performed from the client-side.
     * @param {IGlobalValidator} fn Function to execute when validating the input data.
     * @returns {Editor} Self for chaining
     */
    validator(fn: IGlobalValidator): Editor;
    /**
     * Get the array of conditions applied to the method.
     * @returns {any[]} Knex where conditions.
     */
    where(): any[];
    /**
     * Set a condition for the queries Editor will perform. Editor uses Knex
     * to connect to the database, and exposes the knex object using this method
     * so you can add any conditions you like that are supported by Knex.
     * @param {*} cond Knex query condition
     * @returns {Editor} Self for chaining.
     */
    where(...cond: any[]): Editor;
    private _fileClean;
    private _fileData;
    private _fileDataFields;
    private _findField;
    private _get;
    private _getWhere;
    private _insert;
    private _insertOrUpdate;
    private _insertOrUpdateTable;
    private _alias;
    private _part;
    private _prepJoin;
    private _performLeftJoin;
    private _pkeySeparator;
    private _pkeySubmitMerge;
    private _pkeyValidateInsert;
    private _process;
    private _readTable;
    private _remove;
    private _removeTable;
    private _ssp;
    private _sspField;
    private _sspFilter;
    private _sspLimit;
    private _sspSort;
    private _trigger;
    private _update;
    private _upload;
}
