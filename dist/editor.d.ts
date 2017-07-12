import knex from 'knex';
import Field from './field';
import Mjoin from './mjoin';
import NestedData from './nestedData';
import { IUpload } from './upload';
export declare enum Action {
    Read = 0,
    Create = 1,
    Edit = 2,
    Delete = 3,
    Upload = 4,
}
export interface IDtError {
    name: string;
    status: string;
}
export interface IDtOrder {
    dir: 'asc' | 'desc';
    column: number;
}
export interface IDtColumn {
    data: string;
    searchable: boolean;
    search: {
        value: string;
    };
}
export interface IDtRequest {
    action?: string;
    data?: object[];
    draw?: number;
    start?: number;
    length?: number;
    order?: IDtOrder[];
    columns?: IDtColumn[];
    search?: {
        value: string;
    };
    uploadField?: string;
}
export interface IDtResponse {
    data?: object[];
    cancelled?: string[];
    error?: string;
    fieldErrors?: IDtError[];
    options?: object;
    files?: object;
    draw?: number;
    recordsTotal?: number;
    recordsFiltered?: number;
    upload?: {
        id: string;
    };
}
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
    private _transaction;
    private _where;
    private _leftJoin;
    private _out;
    private _events;
    private _validator;
    private _tryCatch;
    private _knexTransaction;
    private _uploadData;
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
     * @memberof Editor
     */
    data(): IDtResponse;
    db(): knex;
    db(db: knex): Editor;
    field(nameOrField: Field | string): this | Field;
    fields(): Field[];
    fields(...fields: Field[]): Editor;
    idPrefix(): string;
    idPrefix(idPrefix: string): Editor;
    inData(): IDtRequest;
    join(): Mjoin[];
    join(...join: Mjoin[]): Editor;
    leftJoin(table: string, field1: string, operator: string, field2: string): Editor;
    on(name: string, callback: Function): Editor;
    table(): string[];
    table(table: string | string[]): Editor;
    transaction(): boolean;
    transaction(transaction: boolean): Editor;
    pkey(): string[];
    pkey(pkey: string | string[]): Editor;
    pkeyToValue(row: object, flat?: boolean): string;
    pkeyToObject(value: string, flat?: boolean, pkey?: string[]): object;
    process(data: IDtRequest, files?: IUpload): Promise<Editor>;
    tryCatch(): boolean;
    tryCatch(tryCatch: boolean): Editor;
    validate(errors: IDtError[], http: IDtRequest): Promise<boolean>;
    validator(): IGlobalValidator;
    validator(fn: IGlobalValidator): Editor;
    where(): any[];
    where(cond: any): Editor;
    private _fileClean();
    private _fileData(limitTable?, id?);
    private _fileDataFields(files, fields, limitTable, id?);
    private _findField(name, type);
    private _get(id, http?);
    private _getWhere(query);
    private _insert(values);
    private _insertOrUpdate(id, values);
    private _insertOrUpdateTable(table, values, where?);
    private _alias(name, type?);
    private _part(name, type?);
    private _prepJoin();
    private _performLeftJoin(query);
    private _pkeySeparator();
    private _pkeySubmitMerge(pkeyVal, row);
    private _pkeyValidateInsert(row);
    private _process(data, upload);
    private _remove(http);
    private _removeTable(table, ids, pkey?);
    private _ssp(query, http);
    private _sspField(http, index);
    private _sspFilter(query, http);
    private _sspLimit(query, http);
    private _sspSort(query, http);
    private _trigger(name, ...args);
    private _update(id, values);
    private _upload(http);
}
