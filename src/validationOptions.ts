import NestedData from './nestedData';
import ValidationHost from './validationHost';

export type DependsOnFunc = (val: any, data: any, host: ValidationHost) => boolean;

/**
 * Common validation options that can be specified for all validation methods.
 *
 * @export
 * @class ValidationOptions
 */
export default class ValidationOptions extends NestedData {
	private _dependsField: string = null;
	private _dependsValue: any = null;
	private _dependsFn: DependsOnFunc = null;
	private _empty: boolean = true;
	private _message: string = 'Input not valid';
	private _optional: boolean = true;

	/**
	 * Set a function that will be executed to see if a validator should be applied or not.
	 *
	 * @param fn Callback function to check if the validator should apply
	 */
	public dependsOn(fn: DependsOnFunc): this;
	/**
	 * If the given field has a value, this validator will be applied.
	 *
	 * @param field Field to check for a value
	 */
	public dependsOn(field: string): this;
	/**
	 * If the given field has one of the value's specified, this validator will be applied.
	 *
	 * @param field Field to check for a value
	 * @param value Value(s) to check for
	 */
	public dependsOn(field: string, value: any | any[]): this;
	public dependsOn(field: any, value: any | any[] = null) {
		if (typeof field === 'function') {
			this._dependsFn = field;
		}
		else {
			this._dependsField = field;
			this._dependsValue = value;
		}

		return this;
	}

	/**
	 * Allow a field to be empty, i.e. a zero length string -
	 * `''` (`true` - default) or require it to be non-zero length (`false`).
	 */
	public empty(): boolean;
	/**
	 * Set the `empty` option for this validator
	 *
	 * @param set Value to set
	 */
	public empty(set: boolean): this;
	public empty(set?: boolean) {
		if (set === undefined) {
			return this._empty;
		}

		this._empty = set;

		return this;
	}

	/**
	 * Get the error message to be used on validation error
	 */
	public message(): string;
	/**
	 * Set the error message
	 *
	 * @param msg Currently set message
	 */
	public message(msg: string): this;
	public message(msg?: string) {
		if (msg === undefined) {
			return this._message;
		}

		this._message = msg;

		return this;
	}

	/**
	 * Require the field to be submitted (`false`) or not
	 * (`true` - default). When set to `true` the field does not need to be
	 * included in the list of parameters sent by the client - if set to `false`
	 * then it must be included. This option can be particularly useful in Editor
	 * as Editor will not set a value for fields which have not been submitted -
	 * giving the ability to submit just a partial list of options.
	 */
	public optional(): boolean;
	/**
	 * Set the `optional` option for this validator
	 *
	 * @param set Value to set
	 */
	public optional(set: boolean): this;
	public optional(set?: boolean) {
		if (set === undefined) {
			return this._optional;
		}

		this._optional = set;

		return this;
	}

	/**
	 * @ignore internal
	 */
	public runDepends(val: any, data: any, host: ValidationHost): boolean {
		if (this._dependsFn) {
			// External function - call it
			return this._dependsFn(val, data, host);
		}
		else if (this._dependsField) {
			// Get the value that was submitted for the dependent field
			let depFieldVal = this._readProp(this._dependsField, data);

			if (this._dependsValue !== null) {
				// Field and value
				return Array.isArray(this._dependsValue)
					? this._dependsValue.includes(depFieldVal)
					: depFieldVal === this._dependsValue;
			}

			// Just a field - check that the field has a value
			return depFieldVal !== null && depFieldVal !== '';
		}

		// Default is to apply the validator
		return true;
	}

	/**
	 * @ignore internal
	 */
	public static select(user: ValidationOptions | null): ValidationOptions {
		if (user) {
			return user;
		}

		return new ValidationOptions();
	}

	/**
	 * Create validation options
	 *
	 * @param options Options
	 */
	constructor(options: { message?: string; empty?: boolean; optional?: boolean } = {}) {
		super();

		if (options.message !== undefined) {
			this.message(options.message);
		}
		if (options.empty !== undefined) {
			this.empty(options.empty);
		}
		if (options.optional !== undefined) {
			this.optional(options.optional);
		}
	}
}
