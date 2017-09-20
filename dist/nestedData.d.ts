/**
 * Class that provides methods to read and write from nested JSON objects,
 * using dot notation strings for the nesting. This class should be extended
 * by any wishing to use these abilities.
 * @export
 * @class NestedData
 */
export default class NestedData {
    /**
     * @hidden
     * Check if a nested property exists in a data set.
     * @protected
     * @param {string} name Property name
     * @param {object} data Data set to check
     * @returns {boolean} `true` if present, `false` otherwise
     */
    protected _propExists(name: string, data: object): boolean;
    /**
     * @hidden
     * Get a nested property value.
     * @protected
     * @param {string} name Property name
     * @param {object} data Data set to check
     * @returns {*} Value
     */
    protected _readProp(name: string, data: object): any;
    /**
     * @hidden
     * Write a value to a nested data object.
     * @protected
     * @param {object} out Data object to write the value into
     * @param {string} name Nested property name to write to
     * @param {*} value Value to write
     * @returns {void} No return.
     */
    protected _writeProp(out: object, name: string, value: any): void;
}
