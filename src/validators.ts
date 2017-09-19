import * as knex from 'knex';
import * as moment from 'moment';
import * as validUrl from 'valid-url';

import Editor from './editor';
import Field from './field';
import {default as JoinOptions} from './options';
import {IFile} from './upload';
import ValidationHost from './validationHost';
import ValidationOptions from './validationOptions';

// Note that validators return a Promise to allow async validators, such as
// checking a value is unique against the database
export type IValidator = (val: any, data: object, host: ValidationHost) => Promise<true|string>;
export type IFileValidator = (file: IFile) => Promise<true|string>;

export default class Validator {
    public static Options = ValidationOptions;
    public static Host = ValidationHost;

    public static none( cfg: ValidationOptions = null ): IValidator {
        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            return true;
        };
    }

    public static basic( cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );

            return common === false ?
                opts.message :
                true;
        };
    }

    public static required( cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );
        opts.empty = false;
        opts.optional = false;

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );

            return common === false ?
                opts.message :
                true;
        };
    }

    public static notEmpty( cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );
        opts.empty = false;

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );

            return common === false ?
                opts.message :
                true;
        };
    }

    public static boolean( cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            if ( val === true || val === 1 || val === '1' || val === 'true' || val === 't' ||
                 val === 'on' || val === 'yes' || val === false || val === 0 || val === '0' ||
                 val === 'false' || val === 'f' || val === 'off' || val === 'no' )
            {
                return true;
            }

            return opts.message;
        };
    }

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Number validation methods
	 */

    public static numeric( decimal: string = '.', cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            if ( decimal !== '.' ) {
                val = val.toString().replace(decimal, '.');
            }

            return isNaN( parseFloat( val ) ) ?
                opts.message :
                true;
        };
    }

    public static minNum( min: number, decimal: string = '.', cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let numeric = await Validator.numeric( decimal, opts )( val, data, host );
            if ( numeric !== true ) {
                return opts.message;
            }

            if ( decimal !== '.' ) {
                val = val.toString().replace(decimal, '.');
            }

            return val < min ?
                opts.message :
                true;
        };
    }

    public static maxNum( max: number, decimal: string = '.', cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let numeric = await Validator.numeric( decimal, opts )( val, data, host );
            if ( numeric !== true ) {
                return opts.message;
            }

            if ( decimal !== '.' ) {
                val = val.toString().replace(decimal, '.');
            }

            return val > max ?
                opts.message :
                true;
        };
    }

    public static minMaxNum(
        min: number,
        max: number,
        decimal: string = '.',
        cfg: ValidationOptions = null
    ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let numeric = await Validator.numeric( decimal, opts )( val, data, host );
            if ( numeric !== true ) {
                return opts.message;
            }

            if ( decimal !== '.' ) {
                val = val.toString().replace(decimal, '.');
            }

            return val < min || val > max ?
                opts.message :
                true;
        };
    }

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Number validation methods
	 */

    public static email( decimal: string = '.', cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            let re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

            return re.test( val ) ?
                true :
                opts.message;
        };
    }

    public static minLen( min: number, cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            return val.length < min ?
                opts.message :
                true;
        };
    }

    public static maxLen( max: number, cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            return val.length > max ?
                opts.message :
                true;
        };
    }

    public static minMaxLen( min: number, max: number, cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            return val.length < min || val.length > max ?
                opts.message :
                true;
        };
    }

    public static ip( cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            let a = val.split('.');
            if ( a.length !== 4 ) {
                return opts.message;
            }

            for ( let i = 0 ; i < 4 ; i++ ) {
                let parsed = parseInt( a[i], 10 );
                if ( parsed !== a[i] * 1 ) {
                    return opts.message;
                }

                if ( parsed < 0 || parsed > 255 ) {
                    return opts.message;
                }
            }

            return true;
        };
    }

    public static url( cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            return ! validUrl.isHttpUri( val ) ?
                opts.message :
                true;
        };
    }

    public static xss( cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            let field = host.field;

            return field.xssSafety( val ) !== val ?
                opts.message :
                true;
        };
    }

    public static values( values: any[], cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            return values.includes( val ) ?
                true :
                opts.message;
        };
    }

    public static noTags( cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            return val.toString().test(/<.*>/) ?
                opts.message :
                true;
        };
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Date validation methods
    */

    public static dateFormat( format: string, locale: string = null, cfg: ValidationOptions = null ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            let res = locale ?
                moment( val, format, locale, true ).isValid() :
                moment( val, format, true ).isValid();

            return ! res ?
                opts.message :
                true;
        };
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Database validation
    */

    public static dbUnique(
        cfg: ValidationOptions = null,
        column: string = null,
        table: string = null,
        db: knex = null
    ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            if ( db === null ) {
                db = host.db;
            }

            if ( table === null ) {
                table = host.editor.table()[0];
            }

            if ( column === null ) {
                column = host.field.dbField();
            }

            let q = host.db()( table )
                .select( column )
                .where( { column: val } );

            // If doing an edit then we need to also discount the current row,
            // since it is of course already validly unique
            if ( host.action === 'edit' ) {
                let cond = host.editor.pkeyToObject( host.id, true );
                q.whereNot( cond );
            }

            let res = await q;

            return ! res ?
                opts.message :
                true;
        };
    }

    public static dbValues(
        cfg: ValidationOptions = null,
        column: string = null,
        table: string = null,
        db: knex = null
    ): IValidator {
        let opts = ValidationOptions.select( cfg );

        return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
            let common = Validator._common( val, opts );
            let options = host.field.options();

            if ( common !== null ) {
                return common === false ?
                    opts.message :
                    true;
            }

            if ( db === null ) {
                db = host.db;
            }

            if ( table === null && options instanceof JoinOptions ) {
                table = options.table();
            }

            if ( column === null && options instanceof JoinOptions ) {
                column = options.value();
            }

            if ( table === null || column === null ) {
                throw new Error( 'Table or column for database value check is not ' +
                    'defined for field ' + host.field.name()
                );
            }

            let res = await db( table )
                .select( column )
                .where( { [column]: val } );

            return ! res ?
                opts.message :
                true;
        };
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * File upload validators
    */

    public static fileExtensions( extns: string[], msg: string ): IFileValidator {
        return async function( file: IFile ) {
            return extns.includes( file.extn ) ?
                true :
                msg;
        };
    }

    public static fileSize( size: number, msg: string ): IFileValidator {
        return async function( file: IFile ) {
            return file.size > size ?
                msg :
                true;
        };
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Internal methods
    */

    private static _common( val: any, opts: ValidationOptions ): boolean|null {
        // Error state tests
        if ( !opts.optional && val === null ) {
            // Value must be given
            return false;
        }

        if ( val !== null && opts.empty === false && val === '' ) {
            // Value must not be empty
            return false;
        }

        // Validate passed states
        if ( opts.optional && val === null ) {
            return true;
        }

        if ( opts.empty === true && val === '' ) {
            return true;
        }

        // Have the specific validation function perform its tests
        return null;
    }
}
