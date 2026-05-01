import Editor from "./editor.js";

/**
 * Field error object.
 * @export
 */
export interface IDtError {
	/** Row id that caused the error */
	id?: string;

	/** Field name in error. */
	name: string;

	/** Error message string. */
	status: string;
}

/**
 * DataTables request's order object.
 * @export
 */
export interface IDtOrder {
	/** Sorting direction. */
	dir: 'asc' | 'desc';

	/** Column index to sort by. */
	column: number;
}

/**
 * DataTables request's column information object.
 * @export
 */
export interface IDtColumn {
	columnControl?: {
		list?: string[];

		search?: {
			logic: string;
			mask?: string;
			type: string;
			value: string;
		};
	};

	/** Data property (`columns.data`). */
	data: string;

	/** Searchable flag. */

	searchable: boolean;

	/** Search information object. */
	search: {
		/** Search string. */
		value: string;
	};
}

/**
 * DataTables request object. This is the information that DataTables
 * and Editor can send to the server.
 * @export
 */
export interface IDtRequest {
	/** Editor - Action being requested. */
	action?: string;

	/** Editor - Data being sent for create / edit / delete. */
	data?: Record<string, Record<string, any>>;

	/** DataTables SSP - Draw counter. */
	draw?: number;

	/** Dropdown search request from Editor */
	field?: string;

	/** IDs to get (as part of a specific row get request) */
	ids?: string[];

	/** DataTables SSP - paging start point. */
	start?: number;

	/** DataTables SSP - paging length. */
	length?: number;

	/** DataTables SSP - ordering. */
	order?: IDtOrder[];

	/** DataTables SSP - column information. */
	columns?: IDtColumn[];

	/** DataTables SSP - Global search value. */
	search?: {
		value: string;
	};

	/** SearchBuilder search data */
	searchBuilder?: any;

	/** SearchPanes search data */
	searchPanes?: any;

	/** Indicate which panes are looking for empty data */
	searchPanes_null?: any;

	/** Editor - Upload field name. */
	uploadField?: string;

	/** Dropdown values for label lookup */
	values?: any[];
}

/**
 * Response object for DataTables and Editor
 * @export
 */
export interface IDtResponse {
	columnControl?: { [field: string]: object };

	/** DataTables - Array of row information. */
	data?: Record<string, any>[];

	/** Editor - Rows which have not been acted upon. */
	cancelled?: string[];

	/** DataTables and Editor - General error string. */
	error?: string;

	/** Editor - Field information errors. */
	fieldErrors?: IDtError[];

	/** Editor - `select`, `radio` and `checkbox` options. */
	options?: Record<string, Record<string, any>>;

	/** Editor - file information. */
	files?: object;

	/** DataTables SSP - draw counter. */
	draw?: number;

	/** DataTables SSP - number of records in the result set. */
	recordsTotal?: number;

	/** DataTables SSP - number of records after filtering. */
	recordsFiltered?: number;

	/** DataTables SSP - SearchBuilder Options */
	searchBuilder?: any;

	/** DataTables SSP - SearchPanes Options */
	searchPanes?: any;

	/** Editor - Upload complete file id. */
	upload?: {
		id: string;
	};

	/** Debug information if enabled by Editor.debug() */
	debug?: any[];
}

/**
 * Global validation is performed when Editor submits a create, edit or
 * delete request. The function can be useful for cases where fields must
 * be validates together, rather than individually.
 */
export type IGlobalValidator = (
	editor: Editor,
	action: string,
	http: IDtRequest
) => Promise<true | string>;

/**
 * Server-side processing object structure
 * @interface ISSP
 * @private
 */
export interface ISSP {
	draw?: number;
	recordsFiltered?: number;
	recordsTotal?: number;
}

/**
 * Left join object structure
 */
export interface ILeftJoin {
	table: string;
	fn?: Function;
	field1?: string;
	field2?: string;
	operator?: string;
}

export type IGet = (
	id: string | string[] | null,
	http: IDtRequest | null
) => Promise<IDtResponse>;
