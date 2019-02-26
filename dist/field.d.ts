import * as knex from 'knex';
import Editor from './editor';
import { IFormatter } from './formatters';
import NestedData from './nestedData';
import Options, { CustomOptions, IOption } from './options';
import Upload from './upload';
import { IValidator } from './validators';
import { Ixss } from './xss';
/**
 * Set types
 * @export
 */
export declare enum SetType {
    /** Do not set data */
    None = 0,
    /** Write to database on both create and edit */
    Both = 1,
    /** Write to the database only on create */
    Create = 2,
    /** Write to the database only on edit */
    Edit = 3
}
/**
 * Field definitions for the DataTables Editor.
 *
 * Each Database column that is used with Editor can be described with this
 * Field method (both for Editor and Join instances). It basically tells
 * Editor what table column to use, how to format the data and if you want
 * to read and/or write this column.
 *
 * Field instances are used with the {@link Editor.field} and
 * {@link Mjoin.field} methods to describe what fields should be interacted
 * with by the editable table.
 *
 * @export
 * @class Field
 * @extends {NestedData}
 */
export default class Field extends NestedData {
    static SetType: typeof SetType;
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
    /**
     * Creates an instance of Field.
     *
     * @param {string} [dbField=null] Name of the database column
     * @param {string} [name=null] Name to use in the JSON output from Editor and the
     *   HTTP submit from the client-side when editing. If not given then the
     *   `dbField` name is used.
     */
    constructor(dbField?: string, name?: string);
    /**
     * Get the database column name
     *
     * @returns {string} Configured column name
     */
    dbField(): string;
    /**
     * Set the database column name
     *
     * @param {string} dbField Column name to set
     * @returns {Field} Self for chaining
     */
    dbField(dbField: string): Field;
    /**
     * Get the `get` flag for the field (i.e. if the field should be
     * read from the database).
     *
     * @returns {boolean} True if gettable, false otherwise.
     */
    get(): boolean;
    /**
     * Set the `get` flag.
     *
     * @param {boolean} flag `true` to mark as readable, false otherwise
     * @returns {Field} Self for chaining
     */
    get(flag: boolean): Field;
    /**
     * Get formatter for the field's data.
     *
     * @returns {IFormatter} Formatter
     */
    getFormatter(): IFormatter;
    /**
     * Set the get formatter.
     *
     * When the data has been retrieved from the server, it can be passed through
     * a formatter here, which will manipulate (format) the data as required. This
     * can be useful when, for example, working with dates and a particular format
     * is required on the client-side.
     *
     * @param {IFormatter} formatter Formatter to use.
     * @returns {Field} Self for chaining.
     */
    getFormatter(formatter: IFormatter): Field;
    /**
     * Get the currently applied get value.
     *
     * @returns {*} Value - will be undefined by default.
     */
    getValue(): any;
    /**
     * Set the get value for the field.
     *
     * If given, then this value is used to send to the client-side, regardless
     * of what value is held by the database.
     *
     * @param {*} val Value to set
     * @returns {Field} Self for chaining
     */
    getValue(val: any): Field;
    /**
     * Get the field's configured name.
     *
     * @returns {string} Current name.
     */
    name(): string;
    /**
     * Set the field's name.
     *
     * The name is typically the same as the dbField name, since it makes things
     * less confusing(!), but it is possible to set a different name for the data
     * which is used in the JSON returned to DataTables in a 'get' operation and
     * the field name used in a 'set' operation.
     *
     * @param {string} name Name to set
     * @returns {Field} Self for chaining
     */
    name(name: string): Field;
    /**
     * Get the currently configured options for the field.
     *
     * @returns {(Options & CustomOptions)} Options configuration
     */
    options(): Options & CustomOptions;
    /**
     * Set how a list of options (values and labels) will be retrieved for the field.
     *
     * Gets a list of values that can be used for the options list in radio,
     * select and checkbox inputs from the database for this field.
     *
     * Note that this is for simple 'label / value' pairs only. For more complex
     * data, including pairs that require joins and where conditions, use a
     * closure to provide a query
     *
     * @param {(Options & CustomOptions)} opts Options configuration
     * @returns {Field} Self for chaining
     */
    options(opts: Options & CustomOptions): Field;
    /**
     * Get the current `set` property for the field.
     *
     * @returns {SetType} Set configuration
     */
    set(): SetType;
    /**
     * Set the field's `set` configuration.
     *
     * A field can be marked as read only using this option, to be set only
     * during an create or edit action or to be set during both actions. This
     * provides the ability to have fields that are only set when a new row is
     * created (for example a "created" time stamp).
     *
     * @param {(boolean|SetType)} flag Set flag.
     * @returns {Field} Self for chaining.
     */
    set(flag: boolean | SetType): Field;
    /**
     * Set formatter for the field's data.
     *
     * @returns {IFormatter} Formatter
     */
    setFormatter(): IFormatter;
    /**
     * Set the set formatter.
     *
     * When the data has been retrieved from the server, it can be passed through
     * a formatter here, which will manipulate (format) the data as required. This
     * can be useful when, for example, working with dates and a particular format
     * is required on the client-side.
     *
     * Editor has a number of formatters available with the {@link Format} class
     * which can be used directly with this method.
     *
     * @param {IFormatter} formatter Formatter to use.
     * @returns {Field} Self for chaining.
     */
    setFormatter(formatter: IFormatter): Field;
    /**
     * Get the currently applied set value.
     *
     * @returns {*} Value - will be undefined by default.
     */
    setValue(): any;
    /**
     * Set the set value for the field.
     *
     * If given, then this value is used to write to the database regardless
     *  of what data is sent from the client-side.
     *
     * @param {*} val Value to set
     * @returns {Field} Self for chaining
     */
    setValue(val: any): Field;
    /**
     * Get the {@link Upload} class for this field.
     *
     * @returns {Upload} Configured upload class
     */
    upload(): Upload;
    /**
     * Set an {@link Upload} class for this field.
     *
     * @param {Upload} upload Upload class instance
     * @returns {Field} Self for chaining
     */
    upload(upload: Upload): Field;
    /**
     * Get the validators applied to this field.
     *
     * @returns {IValidator[]} Array of validators
     */
    validator(): IValidator[];
    /**
     * Set the 'validator' of the field.
     *
     * The validator can be used to check if any abstract piece of data is valid
     * or not according to the given rules of the validation function used.
     *
     * Multiple validation options can be applied to a field instance by calling
     * this method multiple times. For example, it would be possible to have a
     * 'required' validation and a 'maxLength' validation with multiple calls.
     *
     * Editor has a number of validation available with the {@link Validate} class
     * which can be used directly with this method.
     *
     * @param {IValidator} validator Validator to add to the field
     * @returns {Field} Self for chaining
     */
    validator(validator: IValidator): Field;
    /**
     * Get the current XSS formatter.
     *
     * @returns {Ixss} XSS formatter. Can be null or undefined.
     */
    xss(): Ixss;
    /**
     * Set a formatting method that will be used for XSS checking / removal.
     * This should be a function that takes a single argument (the value to be
     * cleaned) and returns the cleaned value.
     *
     * Editor will use `xss-filters` by default for this operation, which is built
     * into the software and no additional configuration is required, but a
     * custom function can be used if you wish to use a different formatter.
     *
     * If you wish to disable this option (which you would only do if you are
     * absolutely confident that your validation will pick up on any XSS inputs)
     * simply provide a closure function that returns the value given to the
     * function. This is _not_ recommended.
     *
     * @param {(boolean|Ixss)} flag Enable / disable XSS protection, or set a
     *   formatter.
     * @returns {Field} Self for chaining.
     */
    xss(flag: boolean | Ixss): Field;
    /**
     * @hidden
     */
    apply(action: 'get' | 'create' | 'edit', data?: object): boolean;
    /**
     * @hidden
     */
    optionsExec(db: knex): Promise<false | IOption[]>;
    /**
     * @hidden
     */
    val(direction: 'get' | 'set', data: object): any;
    /**
     * @hidden
     */
    validate(data: object, editor: Editor, id?: string): Promise<true | string>;
    /**
     * @hidden
     */
    write(out: object, srcData: object): void;
    /**
     * @hidden
     */
    xssSafety(val: any): any;
    private _format;
}
