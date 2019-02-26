import * as knex from 'knex';
import Editor from './editor';
import Field from './field';
export interface IHostOpts {
    action: string;
    id: string;
    field: Field;
    editor: Editor;
    db: knex;
}
/**
 * Information container about the Field and Editor instances
 * for the item being validated.
 *
 * @export
 */
export default class ValidationHost {
    /**
     * Action being performed (edit, create or remove)
     *
     * @type {string}
     */
    action: string;
    /**
     * Id of the row being edited or removed. Will be undefined for create
     *
     * @type {string}
     */
    id: string;
    /**
     * Field instance
     *
     * @type {Field}
     */
    field: Field;
    /**
     * Editor instance
     *
     * @type {Editor}
     */
    editor: Editor;
    /**
     * Database connection
     *
     * @type {knex}
     */
    db: knex;
    /**
     * Creates an instance of ValidationHost.
     *
     * @param {IHostOpts} opts Host information
     */
    constructor(opts: IHostOpts);
}
