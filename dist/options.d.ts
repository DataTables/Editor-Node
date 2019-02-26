import * as knex from 'knex';
export interface IOption {
    label: string;
    value: string | number;
}
export declare type IRenderer = (row: object) => string;
export declare type CustomOptions = (db: knex) => Promise<IOption[]>;
/**
 * The Options class provides a convenient method of specifying where Editor
 * should get the list of options for a `select`, `radio` or `checkbox` field.
 * This is normally from a table that is _left joined_ to the main table being
 * edited, and a list of the values available from the joined table is shown to
 * the end user to let them select from.
 *
 * `Options` instances are used with the {@link Field.options} method.
 *
 * @export
 * @class Options
 */
export default class Options {
    private _table;
    private _value;
    private _label;
    private _limit;
    private _renderer;
    private _where;
    private _order;
    private _manualOpts;
    /**
     * Add extra options to the list, in addition to any obtained from the database
     *
     * @param label Label
     * @param value Value
     */
    add(label: string, value?: string): this;
    /**
     * Get the column(s) to be used for the label
     *
     * @returns {string[]} Label columns
     */
    label(): string[];
    /**
     * Set the column(s) to be used for the label
     *
     * @param {string[]} label Database column names
     * @returns {Options} Self for chaining
     */
    label(label: string[]): Options;
    /**
     * Get the currently applied LIMIT
     *
     * @returns {number} Limit
     */
    limit(): number;
    /**
     * Set the LIMIT clause to limit the number of records returned
     *
     * @param {number} limit Limit
     * @returns {Options} Self for chaining
     */
    limit(limit: number): Options;
    /**
     * Get the ORDER BY clause for the SQL.
     *
     * @returns {string} ORDER BY clause
     */
    order(): string;
    /**
     * Set the ORDER BY clause to use in the SQL. If this option is not
     * provided the ordering will be based on the rendered output, either
     * numerically or alphabetically based on the data returned by the renderer.
     *
     * @param {string} order ORDER BY statement
     * @returns {Options} Self for chaining
     */
    order(order: string): Options;
    /**
     * Get the configured label renderer
     *
     * @returns {IRenderer} Self for chaining
     */
    render(): IRenderer;
    /**
     * Set the label renderer. The renderer can be used to combine
     * multiple database columns into a single string that is shown as the label
     * to the end user in the list of options.
     *
     * @param {IRenderer} fn Renderering function
     * @returns {Options} Self for chaining
     */
    render(fn: IRenderer): Options;
    /**
     * Get the table that the options will be gathered from.
     *
     * @returns {string} Table name
     */
    table(): string;
    /**
     * Set the database table from which to gather the options for the list.
     *
     * @param {string} table Table name
     * @returns {Options} Self for chaining
     */
    table(table: string): Options;
    /**
     * Get the column name to use for the value in the options list.
     *
     * @returns {string} Column name
     */
    value(): string;
    /**
     * Set the column name to use for the value in the options list. This would
     * normally be the primary key for the table.
     *
     * @param {string} value Column name
     * @returns {Options} Self for chaining
     */
    value(value: string): Options;
    /**
     * Get the WHERE condition for this option set.
     *
     * @returns {*} Knex WHERE condition
     */
    where(): any;
    /**
     * Set the method to use for a WHERE condition if one is to be applied to
     * the query to get the options.
     *
     * @param {*} where Knex WHERE condition
     * @returns {Options} Self for chaining
     */
    where(where: any): Options;
    /**
     * @ignore
     */
    exec(db: knex): Promise<IOption[]>;
}
