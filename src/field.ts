import * as knex from 'knex';

import Editor from './editor';
import {IFormatter} from './formatters';
import NestedData from './nestedData';
import Options, {CustomOptions, IOption} from './options';
import Upload from './upload';
import Validator, {IValidator} from './validators';
import xss, {Ixss} from './xss';

/**
 * Set types
 * @export
 */
export enum SetType {
	/** Do not set data */
	None,

	/** Write to database on both create and edit */
	Both,

	/** Write to the database only on create */
	Create,

	/** Write to the database only on edit */
	Edit
}

/**
 * Field definitions for the DataTables Editor.
 *
 * Each Database column that is used with Editor can be described with this
 * Field method (both for Editor and Join instances). It basically tells
 * Editor what table column to use, how to format the data and if you want
 * to read and/or write this column.
 *
 * Field instances are used with the {@link Editor.field} and
 * {@link Mjoin.field} methods to describe what fields should be interacted
 * with by the editable table.
 *
 * @export
 * @class Field
 * @extends {NestedData}
 */
export default class Field extends NestedData {
	public static SetType = SetType;

	private _dbField: string;
	private _get: boolean = true;
	private _getFormatter: IFormatter;
	private _getValue: any;
	private _opts: Options & CustomOptions;
	private _name: string;
	private _set: SetType = SetType.Both;
	private _setFormatter: IFormatter;
	private _setValue: any;
	private _validator: IValidator[] = [];
	private _upload: Upload;
	private _xss: Ixss;
	private _xssFormat: boolean = true;

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Creates an instance of Field.
	 *
	 * @param {string} [dbField=null] Name of the database column
	 * @param {string} [name=null] Name to use in the JSON output from Editor and the
	 *   HTTP submit from the client-side when editing. If not given then the
	 *   `dbField` name is used.
	 */
	constructor( dbField: string = null, name: string = null ) {
		super();

		if ( ! name && dbField ) {
			// Standard usage, a single parameter
			this
				.name( dbField )
				.dbField( dbField );
		}
		else {
			this
				.name( name )
				.dbField( dbField );
		}
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods
	 */

	/**
	 * Get the database column name
	 *
	 * @returns {string} Configured column name
	 */
	public dbField(): string;
	/**
	 * Set the database column name
	 *
	 * @param {string} dbField Column name to set
	 * @returns {Field} Self for chaining
	 */
	public dbField(dbField: string): Field;
	public dbField(dbField?: string): any {
		if ( dbField === undefined ) {
			return this._dbField;
		}

		this._dbField = dbField;
		return this;
	}

	/**
	 * Get the `get` flag for the field (i.e. if the field should be
	 * read from the database).
	 *
	 * @returns {boolean} True if gettable, false otherwise.
	 */
	public get(): boolean;
	/**
	 * Set the `get` flag.
	 *
	 * @param {boolean} flag `true` to mark as readable, false otherwise
	 * @returns {Field} Self for chaining
	 */
	public get(flag: boolean): Field;
	public get(flag?: boolean): any {
		if ( flag === undefined ) {
			return this._get;
		}

		this._get = flag;
		return this;
	}

	/**
	 * Get formatter for the field's data.
	 *
	 * @returns {IFormatter} Formatter
	 */
	public getFormatter(): IFormatter;
	/**
	 * Set the get formatter.
	 *
	 * When the data has been retrieved from the server, it can be passed through
	 * a formatter here, which will manipulate (format) the data as required. This
	 * can be useful when, for example, working with dates and a particular format
	 * is required on the client-side.
	 *
	 * @param {IFormatter} formatter Formatter to use.
	 * @returns {Field} Self for chaining.
	 */
	public getFormatter(formatter: IFormatter): Field;
	public getFormatter(formatter?: IFormatter): any {
		if ( formatter === undefined ) {
			return this._getFormatter;
		}

		this._getFormatter = formatter;
		return this;
	}

	/**
	 * Get the currently applied get value.
	 *
	 * @returns {*} Value - will be undefined by default.
	 */
	public getValue(): any;
	/**
	 * Set the get value for the field.
	 *
	 * If given, then this value is used to send to the client-side, regardless
	 * of what value is held by the database.
	 *
	 * @param {*} val Value to set
	 * @returns {Field} Self for chaining
	 */
	public getValue(val: any): Field;
	public getValue(val?: any): any {
		if ( val === undefined ) {
			return this._getValue;
		}

		this._getValue = val;
		return this;
	}

	/**
	 * Get the field's configured name.
	 *
	 * @returns {string} Current name.
	 */
	public name(): string;
	/**
	 * Set the field's name.
	 *
	 * The name is typically the same as the dbField name, since it makes things
	 * less confusing(!), but it is possible to set a different name for the data
	 * which is used in the JSON returned to DataTables in a 'get' operation and
	 * the field name used in a 'set' operation.
	 *
	 * @param {string} name Name to set
	 * @returns {Field} Self for chaining
	 */
	public name(name: string): Field;
	public name(name?: string): any {
		if ( name === undefined ) {
			return this._name;
		}

		this._name = name;
		return this;
	}

	/**
	 * Get the currently configured options for the field.
	 *
	 * @returns {(Options & CustomOptions)} Options configuration
	 */
	public options(): Options & CustomOptions;
	/**
	 * Set how a list of options (values and labels) will be retrieved for the field.
	 *
	 * Gets a list of values that can be used for the options list in radio,
	 * select and checkbox inputs from the database for this field.
	 *
	 * Note that this is for simple 'label / value' pairs only. For more complex
	 * data, including pairs that require joins and where conditions, use a
	 * closure to provide a query
	 *
	 * @param {(Options & CustomOptions)} opts Options configuration
	 * @returns {Field} Self for chaining
	 */
	public options(opts: Options & CustomOptions): Field;
	public options(opts?: Options & CustomOptions): any {
		if ( opts === undefined ) {
			return this._opts;
		}

		this._opts = opts;
		return this;
	}

	/**
	 * Get the current `set` property for the field.
	 *
	 * @returns {SetType} Set configuration
	 */
	public set(): SetType;
	/**
	 * Set the field's `set` configuration.
	 *
	 * A field can be marked as read only using this option, to be set only
	 * during an create or edit action or to be set during both actions. This
	 * provides the ability to have fields that are only set when a new row is
	 * created (for example a "created" time stamp).
	 *
	 * @param {(boolean|SetType)} flag Set flag.
	 * @returns {Field} Self for chaining.
	 */
	public set(flag: boolean|SetType): Field;
	public set(flag?: boolean): any {
		if ( flag === undefined ) {
			return this._set;
		}

		if ( flag === true ) {
			this._set = SetType.Both;
		}
		else if ( flag === false ) {
			this._set = SetType.None;
		}
		else {
			this._set = flag;
		}

		return this;
	}

	/**
	 * Set formatter for the field's data.
	 *
	 * @returns {IFormatter} Formatter
	 */
	public setFormatter(): IFormatter;
	/**
	 * Set the set formatter.
	 *
	 * When the data has been retrieved from the server, it can be passed through
	 * a formatter here, which will manipulate (format) the data as required. This
	 * can be useful when, for example, working with dates and a particular format
	 * is required on the client-side.
	 *
	 * Editor has a number of formatters available with the {@link Format} class
	 * which can be used directly with this method.
	 *
	 * @param {IFormatter} formatter Formatter to use.
	 * @returns {Field} Self for chaining.
	 */
	public setFormatter(formatter: IFormatter): Field;
	public setFormatter(formatter?: IFormatter): any {
		if ( formatter === undefined ) {
			return this._setFormatter;
		}

		this._setFormatter = formatter;
		return this;
	}

	/**
	 * Get the currently applied set value.
	 *
	 * @returns {*} Value - will be undefined by default.
	 */
	public setValue(): any;
	/**
	 * Set the set value for the field.
	 *
	 * If given, then this value is used to write to the database regardless
	 *  of what data is sent from the client-side.
	 *
	 * @param {*} val Value to set
	 * @returns {Field} Self for chaining
	 */
	public setValue(val: any): Field;
	public setValue(val?: any): any {
		if ( val === undefined ) {
			return this._setValue;
		}

		this._setValue = val;
		return this;
	}

	/**
	 * Get the {@link Upload} class for this field.
	 *
	 * @returns {Upload} Configured upload class
	 */
	public upload(): Upload;
	/**
	 * Set an {@link Upload} class for this field.
	 *
	 * @param {Upload} upload Upload class instance
	 * @returns {Field} Self for chaining
	 */
	public upload(upload: Upload): Field;
	public upload(upload?: Upload): any {
		if ( upload === undefined ) {
			return this._upload;
		}

		this._upload = upload;
		return this;
	}

	/**
	 * Get the validators applied to this field.
	 *
	 * @returns {IValidator[]} Array of validators
	 */
	public validator(): IValidator[];
	/**
	 * Set the 'validator' of the field.
	 *
	 * The validator can be used to check if any abstract piece of data is valid
	 * or not according to the given rules of the validation function used.
	 *
	 * Multiple validation options can be applied to a field instance by calling
	 * this method multiple times. For example, it would be possible to have a
	 * 'required' validation and a 'maxLength' validation with multiple calls.
	 *
	 * Editor has a number of validation available with the {@link Validate} class
	 * which can be used directly with this method.
	 *
	 * @param {IValidator} validator Validator to add to the field
	 * @returns {Field} Self for chaining
	 */
	public validator(validator: IValidator): Field;
	public validator(validator?: IValidator): any {
		if ( validator === undefined ) {
			return this._validator;
		}

		this._validator.push( validator );
		return this;
	}

	/**
	 * Get the current XSS formatter.
	 *
	 * @returns {Ixss} XSS formatter. Can be null or undefined.
	 */
	public xss(): Ixss;
	/**
	 * Set a formatting method that will be used for XSS checking / removal.
	 * This should be a function that takes a single argument (the value to be
	 * cleaned) and returns the cleaned value.
	 *
	 * Editor will use `xss-filters` by default for this operation, which is built
	 * into the software and no additional configuration is required, but a
	 * custom function can be used if you wish to use a different formatter.
	 *
	 * If you wish to disable this option (which you would only do if you are
	 * absolutely confident that your validation will pick up on any XSS inputs)
	 * simply provide a closure function that returns the value given to the
	 * function. This is _not_ recommended.
	 *
	 * @param {(boolean|Ixss)} flag Enable / disable XSS protection, or set a
	 *   formatter.
	 * @returns {Field} Self for chaining.
	 */
	public xss(flag: boolean|Ixss): Field;
	public xss(flag?: boolean|Ixss): any {
		if ( flag === undefined ) {
			return this._xss;
		}

		if ( flag === true ) {
			this._xss = xss;
		}
		else if ( flag === false ) {
			this._xss = null;
		}
		else {
			this._xss = flag;
		}

		return this;
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Internal methods
	 * Used by the Editor class and not generally for public use
	 */

	/**
	 * @hidden
	 */
	public apply( action: 'get'|'create'|'edit', data?: object ): boolean {
		if ( action === 'get' ) {
			return this._get;
		}

		if ( action === 'create' && (this._set === SetType.None || this._set === SetType.Edit)) {
			return false;
		}
		else if ( action === 'edit' && (this._set === SetType.None || this._set === SetType.Create)) {
			return false;
		}

		// Check it was in the submitted data
		if ( this._setValue === undefined && ! this._propExists( this.name(), data ) ) {
			return false;
		}

		// In the data set, so use it
		return true;
	}

	/**
	 * @hidden
	 */
	public async optionsExec( db: knex ): Promise<false|IOption[]> {
		if ( this._opts instanceof Options ) {
			return await this._opts.exec( db );
		}
		else if ( this._opts ) {
			return await (this._opts as any)( db );
		}
		return false;
	}

	/**
	 * @hidden
	 */
	public val( direction: 'get'|'set', data: object ): any {
		let val;

		if ( direction === 'get' ) {
			if ( this._getValue !== undefined ) {
				val = typeof this._getValue === 'function' ?
					this._getValue() :
					this._getValue;
			}
			else {
				// Getting data, so db field name
				val = data[ this._dbField ] !== undefined ?
					data[ this._dbField ] :
					null;
			}

			return this._format( val, data, this._getFormatter );
		}

		// set - using from the payload, and thus use `name`
		if ( this._setValue !== undefined ) {
			val = typeof this._setValue === 'function' ?
				this._setValue() :
				this._setValue;
		}
		else {
			val = this._readProp( this._name, data );
		}

		return this._format( val, data, this._setFormatter );
	}

	/**
	 * @hidden
	 */
	public async validate( data: object, editor: Editor, id: string = null ): Promise<true|string> {
		if ( this._validator.length === 0 ) {
			return true;
		}

		let val = this._readProp( this.name(), data );
		let host = new Validator.Host( {
			action: editor.inData().action,
			db: editor.db(),
			editor,
			field: this,
			id
		} );

		for ( let i = 0, ien = this._validator.length ; i < ien ; i++ ) {
			let validator = this._validator[i];
			let res = await validator( val, data, host );

			if ( res !== true ) {
				return res;
			}
		}

		// Validation methods all run, must be value
		return true;
	}

	/**
	 * @hidden
	 */
	public write( out: object, srcData: object ): void {
		this._writeProp( out, this.name(), this.val('get', srcData) );
	}

	/**
	 * @hidden
	 */
	public xssSafety( val: any ) {
		if ( ! this._xss ) {
			return val;
		}

		if ( Array.isArray( val ) ) {
			let out = [];

			for ( let i = 0, ien = val.length ; i < ien ; i++ ) {
				out.push( this._xss( val[i] ) );
			}

			return out;
		}

		return this._xss( val );
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	private _format( val: any, data: object, formatter: IFormatter ): any {
		return formatter ?
			formatter( val, data ) :
			val;
	}
}
