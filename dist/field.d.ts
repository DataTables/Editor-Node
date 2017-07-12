import knex from 'knex';
import Editor from './editor';
import { IFormatter } from './formatters';
import NestedData from './nestedData';
import Options, { CustomOptions, IOption } from './options';
import Upload from './upload';
import { IValidator } from './validators';
import { Ixss } from './xss';
export declare enum SetType {
    None = 0,
    Both = 1,
    Create = 2,
    Edit = 3,
}
export default class Field extends NestedData {
    private _dbField;
    private _get;
    private _getFormatter;
    private _getValue;
    private _opts;
    private _name;
    private _set;
    private _setFormatter;
    private _setValue;
    private _validator;
    private _upload;
    private _xss;
    private _xssFormat;
    constructor(dbField?: string, name?: string);
    dbField(): string;
    dbField(dbField: string): Field;
    get(): boolean;
    get(flag: boolean): Field;
    getFormatter(): IFormatter;
    getFormatter(formatter: IFormatter): Field;
    getValue(): any;
    getValue(val: any): Field;
    name(): string;
    name(name: string): Field;
    options(): Options & CustomOptions;
    options(opts: Options & CustomOptions): Field;
    set(): SetType;
    set(flag: boolean | SetType): Field;
    setFormatter(): IFormatter;
    setFormatter(formatter: IFormatter): Field;
    setValue(): any;
    setValue(val: any): Field;
    upload(): Upload;
    upload(upload: Upload): Field;
    validator(): any;
    validator(validator: IValidator): Field;
    xss(): any;
    xss(flag: boolean | Ixss): Field;
    apply(action: 'get' | 'create' | 'edit', data?: object): boolean;
    optionsExec(db: knex): Promise<false | IOption[]>;
    val(direction: 'get' | 'set', data: object): any;
    validate(data: object, editor: Editor, id?: string): Promise<true | string>;
    write(out: object, srcData: object): void;
    xssSafety(val: any): any;
    private _format(val, data, formatter);
}
