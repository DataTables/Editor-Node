import { Options } from '../dist';
import Field from './field';
import { IFormatter } from './formatters';
import SearchBuilderOptions from './searchBuilderOptions';
import SearchPaneOptions from './searchPaneOptions';

export default class Column {
	/** Field instance that Column uses for most functionality */
	private _field: Field;

	/**
	 * Create a new column
	 *
	 * @param dbField Name of the database column
	 * @param name Name to use in the JSON output. If not given then the
	 *   `dbField` name is used.
	 */
	constructor(dbField: string, name?: string) {
		this._field = new Field(dbField, name);
		this._field.set(false);
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods
	 */

	/**
	 * Get the options class for the options to get for ColumnControl
	 */
	public columnControl(): Options;
	/**
	 * Set the options class for the options to get for ColumnControl
	 *
	 * @param options Options configuration for ColumnControl
	 */
	public columnControl(options: Options): this;
	public columnControl(options?: Options) {
		return this._proxy('columnControl', [options]);
	}

	/**
	 * Get the database column name
	 *
	 * @returns Configured column name
	 */
	public dbField(): string;
	/**
	 * Set the database column name
	 *
	 * @param dbField Column name to set
	 * @returns Self for chaining
	 */
	public dbField(name: string): Column;
	public dbField(name?: string): any {
		return this._proxy('dbField', [name]);
	}

	/**
	 * Internal method to get the field instance
	 *
	 * @returns The field
	 * @ignore
	 */
	public field() {
		return this._field;
	}

	/**
	 * Get formatter for the field's data.
	 *
	 * @returns Formatter
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
	 * @param formatter Formatter to use.
	 * @returns Self for chaining.
	 */
	public getFormatter(formatter: IFormatter): Column;
	public getFormatter(formatter?: IFormatter): any {
		return this._proxy('getFormatter', [formatter]);
	}

	/**
	 * Get the currently applied get value.
	 *
	 * @returns Value - will be undefined by default.
	 */
	public getValue(): any;
	/**
	 * Set the get value for the field.
	 *
	 * If given, then this value is used to send to the client-side, regardless
	 * of what value is held by the database.
	 *
	 * @param val Value to set
	 * @returns Self for chaining
	 */
	public getValue(val: any): Column;
	public getValue(val?: any): any {
		return this._proxy('getFormatter', [val]);
	}

	/**
	 * Get the column's configured name.
	 *
	 * @returns Current name.
	 */
	public name(): string;
	/**
	 * Set the column's name.
	 *
	 * The name is typically the same as the dbField name, since it makes things
	 * less confusing(!), but it is possible to set a different name for the
	 * data which is used in the JSON returned to DataTables.
	 *
	 * @param name Name to set
	 * @returns Self for chaining
	 */
	public name(name: string): Column;
	public name(name?: string): any {
		return this._proxy('name', [name]);
	}

	/**
	 * Get the SearchBuilder options for this field if configured
	 *
	 * @return SearchBuilder options
	 */
	public searchBuilderOptions(): SearchBuilderOptions | undefined;

	/**
	 * Set how a list iof options (values and labels) will be retrieved for the
	 * fields SearchBuilder.
	 *
	 * @param sbOpts SearchBuilderOptions
	 * @return Self for chaining
	 */
	public searchBuilderOptions(sbOpts: SearchBuilderOptions): Field;
	public searchBuilderOptions(sbOpts?: SearchBuilderOptions): any {
		return this._proxy('searchBuilderOptions', [sbOpts]);
	}

	/**
	 * Get the SearchPanes options for this field if configured
	 *
	 * @return SearchPanes options
	 */
	public searchPaneOptions(): SearchPaneOptions | undefined;

	/**
	 * Set how a list iof options (values and labels) will be retrieved for the
	 * fields SearchPanes.
	 *
	 * @param sbOpts SearchPanesOptions
	 * @return Self for chaining
	 */
	public searchPaneOptions(spOpts: SearchPaneOptions): Field;
	public searchPaneOptions(spOpts?: SearchPaneOptions): any {
		return this._proxy('searchPaneOptions', [spOpts]);
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Helper method as this class is largely a proxy to `Field`
	 *
	 * @param method Method name to call
	 * @param args Arguments to pass on
	 * @returns Self if the field was returned (i.e. for chaining), or the value
	 *   if it was used as a getter.
	 */
	private _proxy(method: keyof Field, args: any[]) {
		let fn = this._field[method] as any;
		let ret = fn(...args);

		if (ret === this._field) {
			return this;
		}

		return ret;
	}
}
