import * as fs from 'fs';
import * as path from 'path';

import * as rootPath from 'app-root-path';
import * as knex from 'knex';
import * as mv from 'mv';

import Editor from './editor';
import Field from './field';
import promisify from './promisify';

let stat = promisify( fs.stat );
let readFile = promisify( fs.readFile );
let rename = promisify( mv );

export enum DbOpts {
	Content,
	ContentType,
	Extn,
	Name,
	FileName, // Name + Extn
	FileSize,
	MimeType,
	ReadOnly,
	SystemPath
	// Note that the PHP and .NET libraries have a WebPath, but that isn't
	// available here as there isn't a good and reliable way to get the web
	// root in node (it could be anywhere!).
}

export interface IFile {
	uuid: string;
	field: string;
	file: string; // full path
	filename: string; // name + extn
	encoding: string;
	mimetype: string;
	truncated: boolean;
	done: boolean;
	size: number; // Added
	extn: string; // Added
	name: string; // Added
}

export interface IUpload {
	upload: IFile;
}

/**
 * Upload class for Editor. This class provides the ability to easily specify
 * file upload information, specifically how the file should be recorded on
 * the server (database and file system).
 *
 * An instance of this class is attached to a field using the {@link
 * Field.upload} method. When Editor detects a file upload for that file the
 * information provided for this instance is executed.
 *
 * The configuration is primarily driven through the {@link db} and {@link
 * action} methods:
 *
 * * {@link db} Describes how information about the uploaded file is to be
 *   stored on the database.
 * * {@link action} Describes where the file should be stored on the file system
 *   and provides the option of specifying a custom action when a file is
 *   uploaded.
 *
 * Both methods are optional - you can store the file on the server using the
 * {@link db} method only if you want to store the file in the database, or if
 * you don't want to store relational data on the database us only {@link
 * action}. However, the majority of the time it is best to use both - store
 * information about the file on the database for fast retrieval (using a {@link
 * Editor.leftJoin()} for example) and the file on the file system for direct
 * web access.
 *
 * @export
 * @class Upload
 */
export default class Upload {
	public static Db = DbOpts; // legacy
	public static DbOpts = DbOpts;

	private _action: string|Function;
	private _dbCleanCallback; // async function
	private _dbCleanTableField: string;
	private _dbTable: string;
	private _dbPkey: string;
	private _dbFields;
	private _error: string;
	private _validators = [];
	private _where = [];

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	constructor( action: string|Function = null ) {
		if ( action ) {
			this.action( action );
		}
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods
	 */

	/**
	 * Set the action to take when a file is uploaded. This can be either of:
	 *
	 * * A string - the value given is the full system path to where the
	 *   uploaded file is written to. The value given can include three "macros"
	 *   which are replaced by the script dependent on the uploaded file:
	 *   * `__EXTN__` - the file extension
	 *   * `__NAME__` - the uploaded file's name (including the extension)
	 *   * `__ID__` - Database primary key value if the {@link db} method is
	 *     used.
	 * * A closure - if a function is given the responsibility of what to do
	 *   with the uploaded file is transferred to this function. That will
	 *   typically involve writing it to the file system so it can be used
	 *   later.
	 *
	 * @param {(string|Function)} action Upload action
	 * @returns {Upload} Self for chaining
	 */
	public action( action: string|Function ): Upload {
		this._action = action;

		return this;
	}

	/**
	 * Database configuration method. When used, this method will tell Editor
	 * what information you want written to a database on file upload, should
	 * you wish to store relational information about your file on the database
	 * (this is generally recommended).
	 *
	 * @param {string} table The name of the table where the file information
	 *     should be stored
	 * @param {string} pkey Primary key column name. The `Upload` class
	 *     requires that the database table have a single primary key so each
	 *     row can be uniquely identified.
	 * @param {object} fields A list of the fields to be written to on upload.
	 *     The property names are the database columns and the values can be
	 *     defined by the constants of this class. The value can also be a
	 *     string or a closure function if you wish to send custom information
	 *     to the database.
	 * @returns {Upload} Self for chaining
	 */
	public db( table: string, pkey: string, fields: object ): Upload {
		this._dbTable = table;
		this._dbPkey = pkey;
		this._dbFields = fields;

		return this;
	}

	/**
	 * Set a callback function that is used to remove files which no longer have
	 * a reference in a source table.
	 *
	 * @param {(string|Function)} tableField Table field to be used for the delete match
	 * @param {Function} [callback=null] Function that will be executed on clean. It is
	 *   given an array of information from the database about the orphaned
	 *   rows, and can return true to indicate that the rows should be
	 *   removed from the database. Any other return value (including none)
	 *   will result in the records being retained.
	 * @returns {Upload} Self for chaining
	 */
	public dbClean( tableField: string|Function, callback: Function = null ): Upload {
		// Argument swapping
		if ( typeof tableField === 'function' ) {
			this._dbCleanTableField = null;
			this._dbCleanCallback = tableField;
		}
		else {
			this._dbCleanTableField = tableField;
			this._dbCleanCallback = callback;
		}

		return this;
	}

	/**
	 * Add a validation method to check file uploads. Multiple validators can be
	 * added by calling this method multiple times - they will be executed in
	 * sequence when a file has been uploaded.
	 *
	 * @param {any} fn Validation function. A files parameter is
	 *   passed in for the uploaded file and the return is either a string
	 *   (validation failed and error message), or `true` (validation passed).
	 * @returns {Upload} Self for chaining
	 */
	public validator( fn ): Upload {
		this._validators.push( fn );

		return this;
	}

	/**
	 * Add a condition to the data to be retrieved from the database. This
	 * must be given as a function to be executed (usually anonymous) and
	 * will be passed in a single argument, the `Query` object, to which
	 * conditions can be added. Multiple calls to this method can be made.
	 *
	 * @param {any} fn Knex WHERE condition
	 * @returns {Upload} Self for chaining
	 */
	public where( fn ): Upload {
		this._where.push( fn );

		return this;
	}

	/*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
	 * Internal methods
	 */

	/**
	 * @ignore
	 */
	public async data( db: knex, ids: string[] = null ): Promise<object> {
		if ( ! this._dbTable ) {
			return null;
		}

		// Select the details requested, for the columns requested
		let query = db
			.select( this._dbPkey )
			.from( this._dbTable );

		let keys = Object.keys( this._dbFields );
		for ( let i = 0, ien = keys.length ; i < ien ; i++ ) {
			let key = keys[i];

			if ( this._dbFields[ key ] !== DbOpts.Content ) {
				query.select( key );
			}
		}

		if ( ids !== null ) {
			query.whereIn( this._dbPkey, ids );
		}

		for ( let i = 0, ien = this._where.length ; i < ien ; i++ ) {
			query.where( this._where[i] );
		}

		let result = await query;
		let out = {};

		for ( let i = 0, ien = result.length ; i < ien ; i++ ) {
			out[ result[i][ this._dbPkey] ] = result[i];
		}

		return out;
	}

	/**
	 * @ignore
	 */
	public async dbCleanExec( editor: Editor, field: Field ): Promise<void> {
		// Database and file system clean up BEFORE adding the new file to
		// the db, otherwise it will be removed immediately
		let tables = editor.table();
		this._dbClean( editor.db(), tables[0], field.dbField() );
	}

	/**
	 * @ignore
	 */
	public error() {
		return this._error;
	}

	/**
	 * @ignore
	 */
	public async exec( editor: Editor, upload: IUpload ): Promise <string> {
		let id;

		// Add any extra information to the upload structure
		let fileInfo = await stat( upload.upload.file );
		upload.upload.size = fileInfo.size;

		let a = upload.upload.filename.split('.');
		upload.upload.extn = a.length > 1 ?
			a.pop() :
			'';
		upload.upload.name = a.join('.');

		// Validation
		for ( let i = 0, ien = this._validators.length ; i < ien ; i++ ) {
			let result = await this._validators[i]( upload.upload );

			if ( typeof result === 'string' ) {
				this._error = result;
				return null;
			}
		}

		// Database
		if ( this._dbTable ) {
			let fields = Object.keys( this._dbFields );

			for ( let i = 0, ien = fields.length ; i < ien ; i++ ) {
				let prop = this._dbFields[ fields[i] ];

				// We can't know what the path is, if it has moved into place
				// by an external function - throw an error if this does happen
				if ( typeof this._action !== 'string' && prop === DbOpts.SystemPath ) {
					this._error = 'Cannot set path information in the database ' +
						'if a custom method is used to save the file.';

					return null;
				}
			}

			// Commit to the database
			id = await this._dbExec( editor.db(), upload );
		}

		let res = await this._actionExec( id, upload );
		return res;
	}

	/**
	 * @ignore
	 */
	public pkey() {
		return this._dbPkey;
	}

	/**
	 * @ignore
	 */
	public table() {
		return this._dbTable;
	}

	/*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
	 * Private methods
	 */
	private async _actionExec( id: string, files: IUpload ): Promise<string> {
		if ( typeof this._action === 'function' ) {
			let res = await this._action( files.upload, id );
			return res;
		}

		// Default action - move the file to the location specified by the
		// action string
		let to = this._substitute( this._action, files.upload.file, id );
		to = path.normalize( to );

		try {
			await( rename( files.upload.file, to, {mkdirp: true} ) );
		} catch (e) {
			this._error = 'An error occurred while moving the uploaded file.';
			return null;
		}

		return id !== null ?
			id :
			to;
	}

	private async _dbClean( db: knex, editorTable: string, fieldName: string ): Promise<void> {
		let callback = this._dbCleanCallback;
		let that = this;

		if ( ! this._dbTable || ! callback ) {
			return;
		}

		// If there is a table / field that we should use to check if the value
		// is in use, then use that. Otherwise we'll try to use the information
		// from the Editor / Field instance.
		if ( this._dbCleanTableField ) {
			fieldName = this._dbCleanTableField;
		}

		let table;
		let field;
		let a = fieldName.split('.');

		if ( a.length === 1 ) {
			table = editorTable;
			field = a[0];
		}
		else if ( a.length === 2 ) {
			table = a[0];
			field = a[1];
		}
		else {
			table = a[1];
			field = a[2];
		}

		// Select the details requested, for the columns requested
		let fields = this._dbFields;
		let columns = Object.keys( fields );
		let query = db
			.select( this._dbPkey )
			.from( this._dbTable );

		for ( let i = 0, ien = columns.length ; i < ien ; i++ ) {
			let column = columns[i];
			let prop = fields[ column ];

			if ( prop !== DbOpts.Content ) {
				query.select( column );
			}
		}

		query.whereNotIn( this._dbPkey, function() {
			this.select( field ).from( table ).whereNotNull( field );
		} );

		let rows = await query;

		if ( rows.length === 0 ) {
			return;
		}

		let result = await callback( rows );

		// Delete the selected rows, iff the developer says to do so with the
		// returned value (i.e. acknowledge that the files have be removed from
		// the file system)
		if ( result === true ) {
			let queryDel = db
				.from( this._dbTable )
				.where( function() {
					for ( let i = 0, ien = rows.length ; i < ien ; i++ ) {
						this.orWhere( { [that._dbPkey]: rows[i][that._dbPkey] } );
					}
				} );

			await queryDel.del();
		}
	}

	private async _dbExec( db: knex, files: IUpload ): Promise<string> {
		let pathFields = {};
		let fields = this._dbFields;
		let columns = Object.keys( fields );
		let set = {};
		let upload = files.upload;

		for ( let i = 0, ien = columns.length ; i < ien ; i++ ) {
			let column = columns[i];
			let prop = fields[ column ];

			switch ( prop ) {
				case DbOpts.ReadOnly:
					break;

				case DbOpts.Content:
					set[ column ] = await readFile( upload.file );
					break;

				case DbOpts.ContentType:
				case DbOpts.MimeType:
					set[ column ] = upload.mimetype;
					break;

				case DbOpts.Extn:
					set[ column ] = upload.extn;
					break;

				case DbOpts.FileName:
					set[ column ] = upload.filename;
					break;

				case DbOpts.Name:
					set[ column ] = upload.name;
					break;

				case DbOpts.FileSize:
					set[ column ] = upload.size;
					break;

				case DbOpts.SystemPath:
					pathFields[ column ] = this._action;
					set[ column ] = '-'; // Use a temporary value to avoid cases
					break;               // where the db will reject empty values

				default:
					let val = typeof prop === 'function' ?
						prop( db, upload ) :
						prop;

					if ( typeof val === 'string' && val.match(/\{.*\}/) ) {
						pathFields[ column ] = val;
						set[ column ] = '-';
					}
					else {
						set[ column ] = val;
					}
					break;
			}
		}

		let res = await db
			.insert( set )
			.from( this._dbTable )
			.returning( this._dbPkey );

		let id = res[0];

		// Update the newly inserted row with the path information. We have to
		// use a second statement here as we don't know in advance what the
		// database schema is and don't want to prescribe that certain triggers
		// etc be created. It makes it a bit less efficient but much more
		// compatible
		let pathKeys = Object.keys( pathFields );

		if ( pathKeys.length ) {
			// For this to operate the action must be a string, which is
			// validated in the `exec` method
			let toSet = {};

			for ( let i = 0, ien = pathKeys.length ; i < ien ; i++ ) {
				let key = pathKeys[i];
				toSet[ key ] = this._substitute( pathFields[key], upload.file, id );
			}

			await db
				.update( toSet )
				.from( this._dbTable )
				.where( { [this._dbPkey]: id } );
		}

		return id;
	}

	private _substitute( convert: string, uploadPath: string, id: string ): string {
		let a = uploadPath.toString().split( '/' );
		let fileName = a.pop();
		let fileParts = fileName.split('.');
		let extn = fileParts.pop();
		let namePart = fileParts.join('.');

		let to = convert.toString();
		to = to.replace( '{name}', namePart );
		to = to.replace( '{id}', id );
		to = to.replace( '{extn}', extn );

		return to;
	}
}
