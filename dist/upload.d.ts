import knex from 'knex';
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
    SystemPath = 8,
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
export default class Upload {
    static Db: typeof DbOpts;
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
    action(action: string | Function): Upload;
    db(table: string, pkey: string, fields: object): Upload;
    dbClean(tableField: string | Function, callback?: Function): Upload;
    validator(fn: any): Upload;
    where(fn: any): Upload;
    data(db: knex, id?: string): Promise<object>;
    dbCleanExec(editor: Editor, field: Field): Promise<void>;
    error(): string;
    exec(editor: Editor, upload: IUpload): Promise<string>;
    pkey(): string;
    table(): string;
    private _actionExec(id, files);
    private _dbClean(db, editorTable, fieldName);
    private _dbExec(db, files);
    private _substitute(convert, uploadPath, id);
}
