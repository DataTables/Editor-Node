import * as knex from 'knex';
import {Knex} from 'knex';

import Editor from './editor';
import Field from './field';

export interface IHostOpts {
	action: string;
	id: string;
	field: Field;
	editor: Editor;
	db: Knex;
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
	public action: string;

	/**
	 * Id of the row being edited or removed. Will be undefined for create
	 *
	 * @type {string}
	 */
	public id: string;

	/**
	 * Field instance
	 *
	 * @type {Field}
	 */
	public field: Field;

	/**
	 * Editor instance
	 *
	 * @type {Editor}
	 */
	public editor: Editor;

	/**
	 * Database connection
	 *
	 * @type {Knex}
	 */
	public db: Knex;

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Creates an instance of ValidationHost.
	 *
	 * @param {IHostOpts} opts Host information
	 */
	constructor( opts: IHostOpts ) {
		this.action = opts.action;
		this.id = opts.id;
		this.field = opts.field;
		this.editor = opts.editor;
		this.db = opts.db;
	}
}
