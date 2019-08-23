/**
 * Common validation options that can be specified for all validation methods.
 *
 * @export
 * @class ValidationOptions
 */
export default class ValidationOptions {
    /**
     * @ignore
     */
    static select(user: ValidationOptions | null): ValidationOptions;
    /**
     * Error message should the validation fail
     *
     * @type {string}
     */
    message: string;
    /**
     * Allow a field to be empty, i.e. a zero length string -
     * `''` (`true` - default) or require it to be non-zero length (`false`).
     *
     * @type {boolean}
     */
    empty: boolean;
    /**
     * Require the field to be submitted (`false`) or not
     * (`true` - default). When set to `true` the field does not need to be
     * included in the list of parameters sent by the client - if set to `false`
     * then it must be included. This option can be particularly useful in Editor
     * as Editor will not set a value for fields which have not been submitted -
     * giving the ability to submit just a partial list of options.
     *
     * @type {boolean}
     */
    optional: boolean;
    /**
     * Create options
     * @param options Options
     */
    constructor(options?: {
        message?: string;
        empty?: boolean;
        optional?: boolean;
    });
}
