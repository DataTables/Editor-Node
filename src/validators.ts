import * as knex from 'knex';
import * as moment from 'moment';
import * as validUrl from 'valid-url';

import Editor from './editor';
import Field from './field';
import {IMjoinValidator} from './mjoin';
import {default as JoinOptions} from './options';
import {IFile} from './upload';
import ValidationHost from './validationHost';
import ValidationOptions from './validationOptions';

// Note that validators return a Promise to allow async validators, such as
// checking a value is unique against the database
export type IValidator = (val: any, data: object, host: ValidationHost) => Promise<true|string>;
export type IFileValidator = (file: IFile) => Promise<true|string>;

/**
 * Validation methods for DataTables Editor fields. All of the methods
 * defined in this class return a function that can be used by
 * {@link Field} instance's {@link Field.Validator} method.
 *
 * Each method may define its own parameters that configure how the
 * formatter operates. For example the `minLen` validator takes information
 * on the minimum length of value to accept.
 *
 * Additionally each method can optionally take a `ValidationOptions`
 * instance that controls common validation options and error messages.
 *
 * The validation functions return `true` for valid data and a string for
 * invalid data, with the string being the error message.
 *
 * @export
 * @class Validator
 */
export default class Validator {
	public static Options = ValidationOptions;
	public static Host = ValidationHost;

	/**
	 * No validation - all inputs are valid
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static none( cfg: ValidationOptions | null = null ): IValidator {
		return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
			return true;
		};
	}

	/**
	 * Basic validation - this is used to perform the validation provided by the
	 * validation options only. If the validation options pass (e.g. `required`,
	 * `empty` and `optional`) then the validation will pass regardless of the
	 * actual value.
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static basic( cfg: ValidationOptions | null = null ): IValidator {
		let opts = ValidationOptions.select( cfg );

		return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
			let common = Validator._common( val, opts );

			return common === false ?
				opts.message :
				true;
		};
	}

	/**
	 * Required field - there must be a value and it must be a non-empty value
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static required( cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Optional field, but if given there must be a non-empty value
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static notEmpty( cfg: ValidationOptions | null = null ): IValidator {
		let opts = ValidationOptions.select( cfg );
		opts.empty = false;

		return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
			let common = Validator._common( val, opts );

			return common === false ?
				opts.message :
				true;
		};
	}

	/**
	 * Validate an input as a boolean value.
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static boolean( cfg: ValidationOptions | null = null ): IValidator {
		let opts = ValidationOptions.select( cfg );

		return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
			let common = Validator._common( val, opts );
			if ( common !== null ) {
				return common === false ?
					opts.message :
					true;
			}

			if (
				val === true || val === 1 || val === '1' || val === 'true' || val === 't' ||
				val === 'on' || val === 'yes' || val === false || val === 0 || val === '0' ||
				val === 'false' || val === 'f' || val === 'off' || val === 'no'
			) {
				return true;
			}

			return opts.message;
		};
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Number validation methods
	 */

	/**
	 * Check that any input is numeric.
	 *
	 * @static
	 * @param {string} [decimal='.'] Character to use as the decimal place
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static numeric( decimal: string = '.', cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Check for a numeric input and that it is greater than a given value.
	 *
	 * @static
	 * @param {number} min Minimum value
	 * @param {string} [decimal='.'] Character to use as the decimal place
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static minNum( min: number, decimal: string = '.', cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Check for a numeric input and that it is less than a given value.
	 *
	 * @static
	 * @param {number} max Maximum value
	 * @param {string} [decimal='.'] Character to use as the decimal place
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static maxNum( max: number, decimal: string = '.', cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Check for a numeric input and that it is in between two given values.
	 *
	 * @static
	 * @param {number} min Minimum value
	 * @param {number} max Maximum value
	 * @param {string} [decimal='.'] Character to use as the decimal place
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static minMaxNum(
		min: number,
		max: number,
		decimal: string = '.',
		cfg: ValidationOptions | null = null
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
	 * String validation methods
	 */

	/**
	 * Validate an input as an e-mail address.
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static email( cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Validate a string has a minimum length.
	 *
	 * @static
	 * @param {number} min Minimum length
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static minLen( min: number, cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Validate a string is less or equal to a maximum length.
	 *
	 * @static
	 * @param {number} max Maximum length
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static maxLen( max: number, cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Require a string with a certain minimum or maximum number of characters.
	 *
	 * @static
	 * @param {number} min Minimum length
	 * @param {number} max Maximum length
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static minMaxLen( min: number, max: number, cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Validate as an IP address.
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static ip( cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Validate as a URL.
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static url( cfg: ValidationOptions | null = null ): IValidator {
		let opts = ValidationOptions.select( cfg );

		return async function( val: any, data: object, host: ValidationHost ): Promise<true|string> {
			let common = Validator._common( val, opts );
			if ( common !== null ) {
				return common === false ?
					opts.message :
					true;
			}

			return ! validUrl.isHttpUri( val, true ) ?
				opts.message :
				true;
		};
	}

	/**
	 * Check if string could contain an XSS attack string
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static xss( cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Confirm that the value submitted is in a list of allowable values
	 *
	 * @static
	 * @param {any[]} values List of values that are valid
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static values( values: any[], cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Ensure that the submitted string does not contain HTML tags
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static noTags( cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Check that a valid date input is given. Uses MomentJS
	 *
	 * @static
	 * @param {string} format MomentJS date format
	 * @param {string} [locale=null] MomentJS locale
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @returns {IValidator} Configured validation function
	 */
	public static dateFormat( format: string, locale: string | null = null, cfg: ValidationOptions | null = null ): IValidator {
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

	/**
	 * Check that the given value is unique in the database
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @param {string} [column=null] Column name to use to check as a unique
	 *   value. If not given the host field's database column name is used
	 * @param {string} [table=null] Table to check that this value is uniquely
	 *   valid on. If not given the host Editor's table name is used
	 * @param {knex} [db=null] Database connection. If not given the host
	 *   Editor's database connection is used
	 * @returns {IValidator} Configured validation function
	 */
	public static dbUnique(
		cfg: ValidationOptions | null = null,
		column: string | null = null,
		table: string | null = null,
		db: knex | null = null
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

			let q = db( table )
				.select( column )
				.where( { [column]: val } );

			// If doing an edit then we need to also discount the current row,
			// since it is of course already validly unique
			if ( host.action === 'edit' ) {
				let cond = host.editor.pkeyToObject( host.id, true );
				q.whereNot( cond );
			}

			let res = await q;

			return res.length ?
				opts.message :
				true;
		};
	}

	/**
	 * Check that the given value is a value that is available in a database -
	 * i.e. a join primary key. This will attempt to automatically use the table
	 * name and value column from the field's `Options` method (under the
	 * assumption that it will typically be used with a joined field), but the
	 * table and field can also be specified via the options.
	 *
	 * @static
	 * @param {ValidationOptions} [cfg=null] Validation options
	 * @param {string} [column=null] Column name to use to check as a unique
	 *   value. If not given the host field's database column name is used
	 * @param {string} [table=null] Table to check that this value is uniquely
	 *   valid on. If not given the host Editor's table name is used
	 * @param {knex} [db=null] Database connection. If not given the host
	 *   Editor's database connection is used
	 * @returns {IValidator} Configured validation function
	 */
	public static dbValues(
		cfg: ValidationOptions | null = null,
		column: string | null = null,
		table: string | null = null,
		db: knex | null = null,
		values: any[] = []
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

			if ( values.indexOf(val) !== -1 ) {
				return true;
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

	/**
	 * Check that the uploaded file has a given extension
	 *
	 * @static
	 * @param {string[]} extns Allowed extensions
	 * @param {string} msg Error message to return if not valid
	 * @returns {IValidator} Configured validation function
	 */
	public static fileExtensions( extns: string[], msg: string ): IFileValidator {
		return async function( file: IFile ) {
			for ( let i = 0, ien = extns.length; i < ien; i++ ) {
				if ( file.extn.toLowerCase() === extns[i].toLowerCase() ) {
					return true;
				}
			}

			return msg;
		};
	}

	/**
	 * Check that the uploaded file is equal or less than a given size.
	 *
	 * @static
	 * @param {string[]} size Max file size in bytes
	 * @returns {IValidator} Configured validation function
	 */
	public static fileSize( size: number, msg: string ): IFileValidator {
		return async function( file: IFile ) {
			return file.size > size ?
				msg :
				true;
		};
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Mjoin validators
	*/

	/**
	 * Require a minimum value of the number of options / values submitted in
	 * an array
	 *
	 * @static
	 * @param size Min array size required to be valid
	 * @param msg Error message
	 * @returns {IValidator} Configured validation function
	 */
	public static mjoinMinCount( size: number, msg: string ): IMjoinValidator {
		return async function( editor: Editor, action: string, data: any[] ) {
			if ( action === 'create'  || action === 'edit' ) {
				return data.length < size ?
					msg :
					true;
			}
			return true;
		};
	}

	/**
	 * Require a maximum value of the number of options / values submitted in
	 * an array
	 *
	 * @static
	 * @param size Max array size required to be valid
	 * @param msg Error message
	 * @returns {IValidator} Configured validation function
	 */
	public static mjoinMaxCount( size: number, msg: string ): IMjoinValidator {
		return async function( editor: Editor, action: string, data: any[] ) {
			if ( action === 'create'  || action === 'edit' ) {
				return data.length > size ?
					msg :
					true;
			}
			return true;
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
