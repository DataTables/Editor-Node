import * as knex from 'knex';
import { IMjoinValidator } from './mjoin';
import { IFile } from './upload';
import ValidationHost from './validationHost';
import ValidationOptions from './validationOptions';
export declare type IValidator = (val: any, data: object, host: ValidationHost) => Promise<true | string>;
export declare type IFileValidator = (file: IFile) => Promise<true | string>;
/**
 * Validation methods for DataTables Editor fields. All of the methods
 * defined in this class return a function that can be used by
 * {@link Field} instance's {@link Field.Validator} method.
 *
 * Each method may define its own parameters that configure how the
 * formatter operates. For example the `minLen` validator takes information
 * on the minimum length of value to accept.
 *
 * Additionally each method can optionally take a `ValidationOptions`
 * instance that controls common validation options and error messages.
 *
 * The validation functions return `true` for valid data and a string for
 * invalid data, with the string being the error message.
 *
 * @export
 * @class Validator
 */
export default class Validator {
    static Options: typeof ValidationOptions;
    static Host: typeof ValidationHost;
    /**
     * No validation - all inputs are valid
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static none(cfg?: ValidationOptions | null): IValidator;
    /**
     * Basic validation - this is used to perform the validation provided by the
     * validation options only. If the validation options pass (e.g. `required`,
     * `empty` and `optional`) then the validation will pass regardless of the
     * actual value.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static basic(cfg?: ValidationOptions | null): IValidator;
    /**
     * Required field - there must be a value and it must be a non-empty value
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static required(cfg?: ValidationOptions | null): IValidator;
    /**
     * Optional field, but if given there must be a non-empty value
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static notEmpty(cfg?: ValidationOptions | null): IValidator;
    /**
     * Validate an input as a boolean value.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static boolean(cfg?: ValidationOptions | null): IValidator;
    /**
     * Check that any input is numeric.
     *
     * @static
     * @param {string} [decimal='.'] Character to use as the decimal place
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static numeric(decimal?: string, cfg?: ValidationOptions | null): IValidator;
    /**
     * Check for a numeric input and that it is greater than a given value.
     *
     * @static
     * @param {number} min Minimum value
     * @param {string} [decimal='.'] Character to use as the decimal place
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static minNum(min: number, decimal?: string, cfg?: ValidationOptions | null): IValidator;
    /**
     * Check for a numeric input and that it is less than a given value.
     *
     * @static
     * @param {number} max Maximum value
     * @param {string} [decimal='.'] Character to use as the decimal place
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static maxNum(max: number, decimal?: string, cfg?: ValidationOptions | null): IValidator;
    /**
     * Check for a numeric input and that it is in between two given values.
     *
     * @static
     * @param {number} min Minimum value
     * @param {number} max Maximum value
     * @param {string} [decimal='.'] Character to use as the decimal place
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static minMaxNum(min: number, max: number, decimal?: string, cfg?: ValidationOptions | null): IValidator;
    /**
     * Validate an input as an e-mail address.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static email(cfg?: ValidationOptions | null): IValidator;
    /**
     * Validate a string has a minimum length.
     *
     * @static
     * @param {number} min Minimum length
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static minLen(min: number, cfg?: ValidationOptions | null): IValidator;
    /**
     * Validate a string is less or equal to a maximum length.
     *
     * @static
     * @param {number} max Maximum length
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static maxLen(max: number, cfg?: ValidationOptions | null): IValidator;
    /**
     * Require a string with a certain minimum or maximum number of characters.
     *
     * @static
     * @param {number} min Minimum length
     * @param {number} max Maximum length
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static minMaxLen(min: number, max: number, cfg?: ValidationOptions | null): IValidator;
    /**
     * Validate as an IP address.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static ip(cfg?: ValidationOptions | null): IValidator;
    /**
     * Validate as a URL.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static url(cfg?: ValidationOptions | null): IValidator;
    /**
     * Check if string could contain an XSS attack string
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static xss(cfg?: ValidationOptions | null): IValidator;
    /**
     * Confirm that the value submitted is in a list of allowable values
     *
     * @static
     * @param {any[]} values List of values that are valid
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static values(values: any[], cfg?: ValidationOptions | null): IValidator;
    /**
     * Ensure that the submitted string does not contain HTML tags
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static noTags(cfg?: ValidationOptions | null): IValidator;
    /**
     * Check that a valid date input is given. Uses MomentJS
     *
     * @static
     * @param {string} format MomentJS date format
     * @param {string} [locale=null] MomentJS locale
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    static dateFormat(format: string, locale?: string | null, cfg?: ValidationOptions | null): IValidator;
    /**
     * Check that the given value is unique in the database
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @param {string} [column=null] Column name to use to check as a unique
     *   value. If not given the host field's database column name is used
     * @param {string} [table=null] Table to check that this value is uniquely
     *   valid on. If not given the host Editor's table name is used
     * @param {knex} [db=null] Database connection. If not given the host
     *   Editor's database connection is used
     * @returns {IValidator} Configured validation function
     */
    static dbUnique(cfg?: ValidationOptions | null, column?: string | null, table?: string | null, db?: knex | null): IValidator;
    /**
     * Check that the given value is a value that is available in a database -
     * i.e. a join primary key. This will attempt to automatically use the table
     * name and value column from the field's `Options` method (under the
     * assumption that it will typically be used with a joined field), but the
     * table and field can also be specified via the options.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @param {string} [column=null] Column name to use to check as a unique
     *   value. If not given the host field's database column name is used
     * @param {string} [table=null] Table to check that this value is uniquely
     *   valid on. If not given the host Editor's table name is used
     * @param {knex} [db=null] Database connection. If not given the host
     *   Editor's database connection is used
     * @returns {IValidator} Configured validation function
     */
    static dbValues(cfg?: ValidationOptions | null, column?: string | null, table?: string | null, db?: knex | null, values?: any[]): IValidator;
    /**
     * Check that the uploaded file has a given extension
     *
     * @static
     * @param {string[]} extns Allowed extensions
     * @param {string} msg Error message to return if not valid
     * @returns {IValidator} Configured validation function
     */
    static fileExtensions(extns: string[], msg: string): IFileValidator;
    /**
     * Check that the uploaded file is equal or less than a given size.
     *
     * @static
     * @param {string[]} size Max file size in bytes
     * @returns {IValidator} Configured validation function
     */
    static fileSize(size: number, msg: string): IFileValidator;
    /**
     * Require a minimum value of the number of options / values submitted in
     * an array
     *
     * @static
     * @param size Min array size required to be valid
     * @param msg Error message
     * @returns {IValidator} Configured validation function
     */
    static mjoinMinCount(size: number, msg: string): IMjoinValidator;
    /**
     * Require a maximum value of the number of options / values submitted in
     * an array
     *
     * @static
     * @param size Max array size required to be valid
     * @param msg Error message
     * @returns {IValidator} Configured validation function
     */
    static mjoinMaxCount(size: number, msg: string): IMjoinValidator;
    private static _common;
}
