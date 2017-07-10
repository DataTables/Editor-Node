
import knex from 'knex';
import Editor from './editor';
import Field from './field';
import * as fs from 'fs';
import * as path from 'path';
import * as rootPath  from 'app-root-path';
import * as mv  from 'mv';
import promisify from './promisify';


let stat = promisify( fs.stat );
let readFile = promisify( fs.readFile );
let rename = promisify( mv );


export enum DbOpts {
    Content,
    ContentType,
    Extn,
    FileName,
    FileSize,
    MimeType,
    ReadOnly,
    SystemPath
    // Note that the PHP and .NET libraries have a WebPath, but that isn't
    // available here as there isn't a good and reliable way to get the web
    // root in node (it could be anywhere!).
}

export interface IUpload {
    upload: {
        uuid: string,
        field: string,
        file: string,
        filename: string,
        encoding: string,
        mimetype: string,
        truncated: boolean,
        done: boolean
    }
}

export default class Upload {
    public static Db = DbOpts;

    private _action: string|Function;
    private _dbCleanCallback; // async function
    private _dbCleanTableField: string;
    private _dbTable: string;
    private _dbPkey: string;
    private _dbFields;
    private _error: string;
    private _validators = [];
    private _where = [];

    constructor ( action: string|Function=null ) {
        if ( action ) {
            this.action( action );
        }
    }

    public action ( action: string|Function ): Upload {
        this._action = action;

        return this;
    }

    public db ( table: string, pkey: string, fields: object ): Upload {
        this._dbTable = table;
        this._dbPkey = pkey;
        this._dbFields = fields;

        return this;
    }

    public dbClean ( tableField: string|Function, callback: Function=null ): Upload {
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

    public validator ( fn ): Upload {
        this._validators.push( fn );

        return this;
    }

    public where ( fn ): Upload {
        this._where.push( fn );

        return this;
    }



	/*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
	 * Internal methods
	 */
    public async data ( db: knex, id: string=null ): Promise<object> {
        if ( ! this._dbTable ) {
            return null;
        }

        // Select the details requested, for the columns requested
        let query = db( this._dbTable )
            .select( this._dbPkey );

        let keys = Object.keys( this._dbFields );
        for ( let i=0, ien=keys.length ; i<ien ; i++ ) {
            let key = keys[i];

            if ( this._dbFields[ key ] !== DbOpts.Content ) {
                query.select( key );
            }
        }

        if ( id !== null ) {
            query.where( { [this._dbPkey]: id } );
        }

        for ( let i=0, ien=this._where.length ; i<ien ; i++ ) {
            query.where( this._where[i] );
        }

        let result = await query;
        let out = {};

        for ( let i=0, ien=result.length ; i<ien ; i++ ) {
            out[ result[i][ this._dbPkey] ] = result[i];
        }

        return out;
    }

    public async dbCleanExec ( editor: Editor, field: Field ): Promise<void> {
		// Database and file system clean up BEFORE adding the new file to
		// the db, otherwise it will be removed immediately
        let tables = editor.table();
        this._dbClean( editor.db(), tables[0], field.dbField() );
    }

    public error () {
        return this._error;
    }

    public async exec ( editor: Editor, upload: IUpload ): Promise <string> {
        let id;

        // Validation
        for ( let i=0, ien=this._validators.length ; i<ien ; i++ ) {
            let res = await this._validators[i]( upload.upload );

            if ( typeof res === 'string' ) {
                this._error = res;
                return null;
            }
        }

        // Database
        if ( this._dbTable ) {
            let fields = Object.keys( this._dbFields );

            for ( let i=0, ien=fields.length ; i<ien ; i++ ) {
                let prop = this._dbFields[ fields[i] ];

                // We can't know what the path is, if it has moved into place
                // by an external function - throw an error if this does happen
                if ( typeof this._action !== 'string' && prop === DbOpts.SystemPath ) {
                    this._error = 'Cannot set path information in the database '+
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

    public pkey () {
        return this._dbPkey;
    }

    public table () {
        return this._dbTable;
    }


	/*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
	 * Private methods
	 */
    private async _actionExec ( id: string, files: IUpload ): Promise<string> {
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
        }
        catch (e) {
            this._error = 'An error occurred while moving the uploaded file.';
            return null;
        }

        return id !== null ?
            id :
            to;
    }

    private async _dbClean ( db: knex, editorTable: string, fieldName: string ): Promise<void> {
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

        let table, field;
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
        let query = db( this._dbTable )
            .select( this._dbPkey );
        
        for ( let i=0, ien=columns.length ; i<ien ; i++ ) {
            let column = columns[i];
            let prop = fields[ column ];

            if ( prop !== DbOpts.Content ) {
                query.select( column );
            }
        }

        query.whereNotIn( this._dbPkey, function () {
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
            let queryDel = db( this._dbTable )
                .where( function () {
                    for ( let i=0, ien=rows.length ; i<ien ; i++ ) {
                        this.orWhere( { [that._dbPkey]: rows[i][that._dbPkey] } );
                    }
                } )
            
            await queryDel.del();
        }
    }

    private async _dbExec ( db: knex, files: IUpload ): Promise<string> {
        let pathFields = {};
        let fields = this._dbFields;
        let columns = Object.keys( fields );
        let set = {};
        let upload = files.upload;
        
        for ( let i=0, ien=columns.length ; i<ien ; i++ ) {
            let column = columns[i];
            let prop = fields[ column ];

            switch( prop ) {
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
                    let a = upload.file.split('/');
                    let b = a[ a.length-1 ].split('.');
                    set[ column ] = b[ b.length-1 ];
                    break;
                
                case DbOpts.FileName:
                    let c = upload.file.split('/');
                    set[ column ] = c[ c.length-1 ];
                    break;
                
                case DbOpts.FileSize:
                    let fileInfo = await stat( upload.file );
                    set[ column ] = fileInfo.size;
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

        let res = await db( this._dbTable )
            .insert( set )
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
            let set = {};

            for ( let i=0, ien=pathKeys.length ; i<ien ; i++ ) {
                let key = pathKeys[i];
                set[ key ] = this._substitute( pathFields[key], upload.file, id );
            }

            await db( this._dbTable )
                .update( set )
                .where( { [this._dbPkey]: id } );
        }

        return id;
    }

    private _substitute ( convert: string, uploadPath: string, id: string ): string {
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