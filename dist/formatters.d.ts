export declare type IFormatter = (val: any, data: object) => any;
/**
 * Formatter methods which can be used with {@link Field.getFormatter} and
 * {@link Field.setFormatter}.
 *
 * The methods in this class return a function for use with the formatter
 * methods. Each method may define its own parameters that configure how
 * the formatter operates. For example the date / time formatters take
 * information on the formatting to be used.
 *
 * @export
 */
export default class Formatter {
    /**
     * Convert from SQL date / date time format (ISO8601) to a format given
     * by the options parameter. Typically used with a get formatter.
     *
     * Uses MomentJS - formats are defined by Moment.
     *
     * @static
     * @param {string} format Format to convert to.
     * @returns {IFormatter} Configured formatter function
     */
    static sqlDateToFormat(format: string): IFormatter;
    /**
     * Convert to SQL date / date time format (ISO8601) from a format given
     * by the options parameter. Typically used with a set formatter.
     *
     * Uses MomentJS - formats are defined by Moment.
     *
     * @static
     * @param {string} format Format to convert from.
     * @returns {IFormatter} Configured formatter function
     */
    static formatToSqlDate(format: string): IFormatter;
    /**
     * Convert from one date time format to another.
     *
     * Uses MomentJS - formats are defined by Moment.
     *
     * @static
     * @param {string} from From format
     * @param {string} to To format.
     * @returns {IFormatter} Configured formatter function
     */
    static dateTime(from: string, to: string): IFormatter;
    /**
     * Convert a string of values into an array for use with checkboxes.
     *
     * @static
     * @param {string} [delimiter='|'] Delimiter string (i.e. what to split on)
     * @returns {IFormatter} Configured formatter function
     */
    static explode(delimiter?: string): IFormatter;
    /**
     * Convert an array of values from a checkbox into a string which can be
     * used to store in a text field in a database.
     *
     * @static
     * @param {string} [delimiter='|'] Delimiter string (i.e. what to join on)
     * @returns {IFormatter} Configured formatter function
     */
    static implode(delimiter?: string): IFormatter;
    /**
     * Convert an empty string to `null`. Null values are very useful in
     * databases, but HTTP variables have no way of representing `null` as a
     * value, often leading to an empty string and null overlapping. This method
     * will check the value to operate on and return null if it is empty.
     *
     * @static
     * @param {*} emptyValue Value to use if an empty value is submitted. `null`
     *   is the typical value.
     * @returns {IFormatter} Configured formatter function
     */
    static ifEmpty(emptyValue: any): IFormatter;
    /**
     * Convert a number from using any character other than a period (dot) to
     * one which does use a period. This is useful for allowing numeric user
     * input in regions where a comma is used as the decimal character. Use with
     * a set formatter.
     *
     * @static
     * @param {string} [char=','] Decimal place character
     * @returns {IFormatter} Configured formatter function
     */
    static fromDecimalChar(char?: string): IFormatter;
    /**
     * Convert a number with a period (dot) as the decimal character to use
     * a different character (typically a comma). Use with a get formatter.
     *
     * @static
     * @param {string} [char=','] Decimal place character
     * @returns {IFormatter} Configured formatter function
     */
    static toDecimalChar(char?: string): IFormatter;
}
