import NestedData from './nestedData';
import ValidationHost from './validationHost';
export type DependsOnFunc = (val: any, data: any, host: ValidationHost) => boolean;
/**
 * Common validation options that can be specified for all validation methods.
 *
 * @export
 * @class ValidationOptions
 */
export default class ValidationOptions extends NestedData {
    private _dependsField;
    private _dependsValue;
    private _dependsFn;
    private _empty;
    private _message;
    private _optional;
    /**
     * Set a function that will be executed to see if a validator should be applied or not.
     *
     * @param fn Callback function to check if the validator should apply
     */
    dependsOn(fn: DependsOnFunc): this;
    /**
     * If the given field has a value, this validator will be applied.
     *
     * @param field Field to check for a value
     */
    dependsOn(field: string): this;
    /**
     * If the given field has one of the value's specified, this validator will be applied.
     *
     * @param field Field to check for a value
     * @param value Value(s) to check for
     */
    dependsOn(field: string, value: any | any[]): this;
    /**
     * Allow a field to be empty, i.e. a zero length string -
     * `''` (`true` - default) or require it to be non-zero length (`false`).
     */
    empty(): boolean;
    /**
     * Set the `empty` option for this validator
     *
     * @param set Value to set
     */
    empty(set: boolean): this;
    /**
     * Get the error message to be used on validation error
     */
    message(): string;
    /**
     * Set the error message
     *
     * @param msg Currently set message
     */
    message(msg: string): this;
    /**
     * Require the field to be submitted (`false`) or not
     * (`true` - default). When set to `true` the field does not need to be
     * included in the list of parameters sent by the client - if set to `false`
     * then it must be included. This option can be particularly useful in Editor
     * as Editor will not set a value for fields which have not been submitted -
     * giving the ability to submit just a partial list of options.
     */
    optional(): boolean;
    /**
     * Set the `optional` option for this validator
     *
     * @param set Value to set
     */
    optional(set: boolean): this;
    /**
     * @ignore internal
     */
    runDepends(val: any, data: any, host: ValidationHost): boolean;
    /**
     * @ignore internal
     */
    static select(user: ValidationOptions | null): ValidationOptions;
    /**
     * Create validation options
     *
     * @param options Options
     */
    constructor(options?: {
        message?: string;
        empty?: boolean;
        optional?: boolean;
    });
}
