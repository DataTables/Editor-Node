import * as knex from 'knex';
import Editor from './editor';
import Field from './field';
import { IFile } from './upload';
export interface IValidator {
    (val: any, data: object, host: Host): Promise<true | string>;
}
export interface IFileValidator {
    (file: IFile): Promise<true | string>;
}
export interface HostOpts {
    action: string;
    id: string;
    field: Field;
    editor: Editor;
    db: knex;
}
export declare class Options {
    message: string;
    empty: boolean;
    optional: boolean;
    static select(user: Options): Options;
}
export declare class Host {
    action: string;
    id: string;
    field: Field;
    editor: Editor;
    db: knex;
    constructor(opts: HostOpts);
}
export default class Validator {
    static Options: typeof Options;
    static Host: typeof Host;
    static none(cfg?: Options): IValidator;
    static basic(cfg?: Options): IValidator;
    static required(cfg?: Options): IValidator;
    static notEmpty(cfg?: Options): IValidator;
    static boolean(cfg?: Options): IValidator;
    static numeric(decimal?: string, cfg?: Options): IValidator;
    static minNum(min: number, decimal?: string, cfg?: Options): IValidator;
    static maxNum(max: number, decimal?: string, cfg?: Options): IValidator;
    static minMaxNum(min: number, max: number, decimal?: string, cfg?: Options): IValidator;
    static email(decimal?: string, cfg?: Options): IValidator;
    static minLen(min: number, cfg?: Options): IValidator;
    static maxLen(max: number, cfg?: Options): IValidator;
    static minMaxLen(min: number, max: number, cfg?: Options): IValidator;
    static ip(cfg?: Options): IValidator;
    static url(cfg?: Options): IValidator;
    static xss(cfg?: Options): IValidator;
    static values(values: any[], cfg?: Options): IValidator;
    static noTags(cfg?: Options): IValidator;
    static dateFormat(format: string, locale?: string, cfg?: Options): IValidator;
    static dbUnique(cfg?: Options, column?: string, table?: string, db?: knex): IValidator;
    static dbValues(cfg?: Options, column?: string, table?: string, db?: knex): IValidator;
    static fileExtensions(extns: string[], msg: string): IFileValidator;
    static fileSize(size: number, msg: string): IFileValidator;
    private static _common(val, opts);
}
