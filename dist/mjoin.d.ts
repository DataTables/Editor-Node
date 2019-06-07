import Editor, { IDtRequest, IDtResponse } from './editor';
import Field from './field';
import NestedData from './nestedData';
/**
 * Grouped validation
 */
export declare type IMjoinValidator = (editor: Editor, action: string, data: IDtRequest) => Promise<true | string>;
/**
 * The MJoin class provides a one-to-many join link for Editor. This can
 * be useful in cases were an attribute can take multiple values at the
 * same time - for example cumulative security access levels.
 *
 * Typically the MJoin class should be used with a link table, but this is
 * optional. Please note that if you don't use a link table you should be
 * aware that on edit the linked rows are deleted and then reinserted, thus
 * if any values should be retained they should also be submitted.
 *
 * Please refer to the Editor Node documentation for further information
 * https://editor.datatables.net/manual/node
 *
 * @export
 * @class Mjoin
 * @extends {NestedData}
 */
export default class Mjoin extends NestedData {
    private _table;
    private _editor;
    private _name;
    private _get;
    private _set;
    private _where;
    private _fields;
    private _links;
    private _order;
    private _join;
    private _validators;
    /**
     * Creates an instance of Mjoin.
     *
     * @param {string} table Table name being joined to
     */
    constructor(table: string);
    /**
     * Get or field by name, or add a field instance.
     *
     * @param {(Field|string)} nameOrField Field instance to add, or field name to get
     * @returns Mjoin instance if adding a field, Field instance if getting a field.
     */
    field(nameOrField: string): any;
    field(nameOrField: Field): any;
    /**
     * Get the fields assigned to this instance.
     * @returns {Field[]} Array of fields
     */
    fields(): Field[];
    /**
     * Add one or more fields to the instance.
     * @param {...Field[]} fields Fields to add
     * @returns {Mjoin} Self for chaining
     */
    fields(...fields: Field[]): Mjoin;
    /**
     * Get the `get` flag for all fields in the Mjoin instance.
     *
     * @returns {boolean} True if gettable, false otherwise.
     */
    get(): boolean;
    /**
     * Set the `get` flag for all fields in the Mjoin instance.
     * When set to false no read operations will occur on the join tables.
     *
     * @param {boolean} flag `true` to mark as readable, false otherwise
     * @returns {Mjoin} Self for chaining
     */
    get(flag: boolean): Mjoin;
    /**
     * Create a join link between two tables. The order of the fields does not
     * matter, but each field must contain the table name as well as the field
     * name.
     *
     * This method can be called a maximum of two times for an Mjoin instance:
     *
     * * First time, creates a link between the Editor host table and a join
     *   table
     * * Second time creates the links required for a link table.
     *
     * Please refer to the Editor Mjoin documentation for further details:
     * https://editor.datatables.net/manual/php
     *
     * @param {string} field1 Table and field name
     * @param {string} field2 Table and field name
     * @returns {Mjoin} Self for chaining
     */
    link(field1: string, field2: string): Mjoin;
    /**
     * Get the instance's configured name.
     *
     * The `name` of the Join is the JSON property key that is used when
     * 'getting' the data, and the HTTP property key (in a JSON style) when
     * 'setting' data. Typically the name of the db table will be used here,
     * but this method allows that to be overridden.
     *
     * @returns {string} Current name.
     */
    name(): string;
    /**
     * Set the instance's name
     *
     * @param {string} name Name to set
     * @returns {Mjoin} Self for chaining
     */
    name(name: string): Mjoin;
    /**
     * Get the column name to order the data by
     *
     * @returns {string} SQL column name
     */
    order(): string;
    /**
     * Specify the property that the data will be sorted by.
     *
     * @param {string} order SQL column name to order the data by
     * @returns {Mjoin} Self for chaining
     */
    order(order: string): Mjoin;
    /**
     * Get the current `set` property for the instance.
     *
     * When set to false no write operations will occur on the join tables.
     * This can be useful when you want to display information which is joined,
     * but want to only perform write operations on the parent table.
     *
     * @returns {boolean} Set configuration
     */
    set(): boolean;
    /**
     * Set the instance's set property
     *
     * @param {(boolean)} flag Set flag.
     * @returns {Mjoin} Self for chaining.
     */
    set(flag: boolean): Mjoin;
    /**
     * Get join table name.
     *
     * Please note that this will also set the {@link name} used by the Join
     * as well. This is for convenience as the JSON output / HTTP input will
     * typically use the same name as the database name. If you want to set a
     * custom name, the {@link name} method must be called ***after*** this one.
     *
     * @returns {string} Join table name
     */
    table(): string;
    /**
     * Set column join name
     *
     * @param {string} table Join table name
     * @returns {Mjoin} Self for chaining
     */
    table(table: string): Mjoin;
    /**
     * Set a validator for the array of data (not on a field basis)
     *
     * @param fieldName Name of the field that any error should be shown
     *   against on the client-side
     * @param fn Callback function for validation
     */
    validator(fieldName: string, fn: IMjoinValidator): this;
    /**
     * Get the array of conditions applied to the method.
     *
     * @returns {any[]} Knex where conditions.
     */
    where(): any[];
    /**
     * Where condition to add to the query used to get data from the database.
     * Note that this is applied to the child table.
     *
     * @param {*} cond Knex query condition
     * @returns {Mjoin} Self for chaining.
     */
    where(cond: any): Mjoin;
    /**
     * @ignore
     */
    data(editor: Editor, response: IDtResponse): Promise<void>;
    /**
     * @ignore
     */
    create(editor: Editor, parentId: string, data: object): Promise<void>;
    /**
     * @ignore
     */
    update(editor: Editor, parentId: string, data: object): Promise<void>;
    /**
     * @ignore
     */
    remove(editor: Editor, ids: string[]): Promise<void>;
    /**
     * @ignore
     */
    validate(errors: any, editor: Editor, data: object, action: string): Promise<void>;
    private _applyWhere;
    private _insert;
    private _prepare;
    private _validateFields;
}
