import * as knex from 'knex';
import Editor from './editor';
import Field from './field';
export declare enum DbOpts {
    Content = 0,
    ContentType = 1,
    Extn = 2,
    Name = 3,
    FileName = 4,
    FileSize = 5,
    MimeType = 6,
    ReadOnly = 7,
    SystemPath = 8
}
export interface IFile {
    uuid: string;
    field: string;
    file: string;
    filename: string;
    encoding: string;
    mimetype: string;
    truncated: boolean;
    done: boolean;
    size: number;
    extn: string;
    name: string;
}
export interface IUpload {
    upload: IFile;
}
/**
 * Upload class for Editor. This class provides the ability to easily specify
 * file upload information, specifically how the file should be recorded on
 * the server (database and file system).
 *
 * An instance of this class is attached to a field using the {@link
 * Field.upload} method. When Editor detects a file upload for that file the
 * information provided for this instance is executed.
 *
 * The configuration is primarily driven through the {@link db} and {@link
 * action} methods:
 *
 * * {@link db} Describes how information about the uploaded file is to be
 *   stored on the database.
 * * {@link action} Describes where the file should be stored on the file system
 *   and provides the option of specifying a custom action when a file is
 *   uploaded.
 *
 * Both methods are optional - you can store the file on the server using the
 * {@link db} method only if you want to store the file in the database, or if
 * you don't want to store relational data on the database us only {@link
 * action}. However, the majority of the time it is best to use both - store
 * information about the file on the database for fast retrieval (using a {@link
 * Editor.leftJoin()} for example) and the file on the file system for direct
 * web access.
 *
 * @export
 * @class Upload
 */
export default class Upload {
    static Db: typeof DbOpts;
    static DbOpts: typeof DbOpts;
    private _action;
    private _dbCleanCallback;
    private _dbCleanTableField;
    private _dbTable;
    private _dbPkey;
    private _dbFields;
    private _error;
    private _validators;
    private _where;
    constructor(action?: string | Function);
    /**
     * Set the action to take when a file is uploaded. This can be either of:
     *
     * * A string - the value given is the full system path to where the
     *   uploaded file is written to. The value given can include three "macros"
     *   which are replaced by the script dependent on the uploaded file:
     *   * `__EXTN__` - the file extension
     *   * `__NAME__` - the uploaded file's name (including the extension)
     *   * `__ID__` - Database primary key value if the {@link db} method is
     *     used.
     * * A closure - if a function is given the responsibility of what to do
     *   with the uploaded file is transferred to this function. That will
     *   typically involve writing it to the file system so it can be used
     *   later.
     *
     * @param {(string|Function)} action Upload action
     * @returns {Upload} Self for chaining
     */
    action(action: string | Function): Upload;
    /**
     * Database configuration method. When used, this method will tell Editor
     * what information you want written to a database on file upload, should
     * you wish to store relational information about your file on the database
     * (this is generally recommended).
     *
     * @param {string} table The name of the table where the file information
     *     should be stored
     * @param {string} pkey Primary key column name. The `Upload` class
     *     requires that the database table have a single primary key so each
     *     row can be uniquely identified.
     * @param {object} fields A list of the fields to be written to on upload.
     *     The property names are the database columns and the values can be
     *     defined by the constants of this class. The value can also be a
     *     string or a closure function if you wish to send custom information
     *     to the database.
     * @returns {Upload} Self for chaining
     */
    db(table: string, pkey: string, fields: object): Upload;
    /**
     * Set a callback function that is used to remove files which no longer have
     * a reference in a source table.
     *
     * @param {(string|Function)} tableField Table field to be used for the delete match
     * @param {Function} [callback=null] Function that will be executed on clean. It is
     *   given an array of information from the database about the orphaned
     *   rows, and can return true to indicate that the rows should be
     *   removed from the database. Any other return value (including none)
     *   will result in the records being retained.
     * @returns {Upload} Self for chaining
     */
    dbClean(tableField: string | Function, callback?: Function): Upload;
    /**
     * Add a validation method to check file uploads. Multiple validators can be
     * added by calling this method multiple times - they will be executed in
     * sequence when a file has been uploaded.
     *
     * @param {any} fn Validation function. A files parameter is
     *   passed in for the uploaded file and the return is either a string
     *   (validation failed and error message), or `true` (validation passed).
     * @returns {Upload} Self for chaining
     */
    validator(fn: any): Upload;
    /**
     * Add a condition to the data to be retrieved from the database. This
     * must be given as a function to be executed (usually anonymous) and
     * will be passed in a single argument, the `Query` object, to which
     * conditions can be added. Multiple calls to this method can be made.
     *
     * @param {any} fn Knex WHERE condition
     * @returns {Upload} Self for chaining
     */
    where(fn: any): Upload;
    /**
     * @ignore
     */
    data(db: knex, ids?: string[]): Promise<object>;
    /**
     * @ignore
     */
    dbCleanExec(editor: Editor, field: Field): Promise<void>;
    /**
     * @ignore
     */
    error(): string;
    /**
     * @ignore
     */
    exec(editor: Editor, upload: IUpload): Promise<string>;
    /**
     * @ignore
     */
    pkey(): string;
    /**
     * @ignore
     */
    table(): string;
    private _actionExec;
    private _dbClean;
    private _dbExec;
    private _substitute;
}
