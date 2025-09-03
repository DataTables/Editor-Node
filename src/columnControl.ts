import Editor, { IDtRequest } from './editor';
import { Knex } from 'knex';

export default class ColumnControl {
	public static ssp(editor: Editor, query: Knex.QueryBuilder<any, any>, http: IDtRequest) {
		for (let i = 0; i < http.columns.length; i++) {
			let column = http['columns'][i];

			if (column.columnControl) {
				let field = editor.field(column['data']);

				// `<input>` based searches
				if (column.columnControl.search) {
					let search = column.columnControl.search;
					let value = search.value;
					let logic = search.logic;
					let type = search.type;

					if (type === 'num') {
						ColumnControl._sspNumber(query, field, value, logic);
					}
					else if (type === 'date') {
						ColumnControl._sspDate(query, field, value, logic, search.mask);
					}
					else {
						ColumnControl._sspText(query, field, value, logic);
					}
				}

				// SearchList
				if (column.columnControl.list) {
					let list = column.columnControl.list;

					query.whereIn(field.dbField(), list);
				}
			}
		}
	}

	/**
	 * Add conditions to a query for a ColumnControl date search.
	 *
	 * @param query Query to add the conditions to
	 * @param field Field for the column in question
	 * @param value Search term
	 * @param logic Search logic
	 * @param mask Mask value
	 * @returns void
	 */
	private static _sspDate(query, field, value, logic, mask) {
		let dbField = field.dbField();
		let search = '(?)';

		// Only support date and time masks. This departs from the client side which allows
		// any component in the date/time to be masked out.
		if (mask === 'YYYY-MM-DD') {
			dbField = 'DATE(' + dbField + ')';
			search = 'DATE(?)';
		}
		else if (mask === 'hh:mm:ss') {
			dbField = 'TIME(' + dbField + ')';
			search = 'TIME(?)';
		}

		if (logic === 'empty') {
			query.whereNull(field.dbField());
		}
		else if (logic === 'notEmpty') {
			query.whereNotNull(field.dbField());
		}
		else if (value === '') {
			// Empty search value means no search for the other logic operators
			return;
		}
		else if (logic === 'equal') {
			query.whereRaw(dbField + ' = ' + search, [value]);
		}
		else if (logic === 'notEqual') {
			query.whereRaw(dbField + ' != ' + search, [value]);
		}
		else if (logic === 'greater') {
			query.whereRaw(dbField + ' > ' + search, [value]);
		}
		else if (logic === 'less') {
			query.whereRaw(dbField + ' < ' + search, [value]);
		}
	}

	/**
	 * Add conditions to a query for a ColumnControl number search.
	 *
	 * @param query Query to add the conditions to
	 * @param field Field for the column in question
	 * @param value Search term
	 * @param logic Search logic
	 * @returns void
	 */
	private static _sspNumber(query, field, value, logic) {
		if (logic === 'empty') {
			query.where((q) => {
				q.whereNull(field.dbField());
				q.orWhere(field.dbField(), '=', '');
			});
		}
		else if (logic === 'notEmpty') {
			query.where((q) => {
				q.whereNotNull(field.dbField());
				q.where(field.dbField(), '!=', '');
			});
		}
		else if (value === '') {
			// Empty search value means no search for the other logic operators
			return;
		}
		else if (logic === 'equal') {
			query.where(field.dbField(), '=', value);
		}
		else if (logic === 'notEqual') {
			query.where(field.dbField(), '!=', value);
		}
		else if (logic === 'greater') {
			query.where(field.dbField(), '>', value);
		}
		else if (logic === 'greaterOrEqual') {
			query.where(field.dbField(), '>=', value);
		}
		else if (logic === 'less') {
			query.where(field.dbField(), '<', value);
		}
		else if (logic === 'lessOrEqual') {
			query.where(field.dbField(), '<=', value);
		}
	}

	/**
	 * Add conditions to a query for a ColumnControl test search.
	 *
	 * @param query Query to add the conditions to
	 * @param field Field for the column in question
	 * @param value Search term
	 * @param logic Search logic
	 * @returns void
	 */
	private static _sspText(query, field, value, logic) {
		if (logic === 'empty') {
			query.where((q) => {
				q.whereNull(field.dbField());
				q.orWhere(field.dbField(), '=', '');
			});
		}
		else if (logic === 'notEmpty') {
			query.where((q) => {
				q.whereNotNull(field.dbField());
				q.where(field.dbField(), '!=', '');
			});
		}
		else if (value === '') {
			// Empty search value means no search for the other logic operators
			return;
		}
		else if (logic === 'equal') {
			query.where(field.dbField(), '=', value);
		}
		else if (logic === 'notEqual') {
			query.where(field.dbField(), '!=', value);
		}
		else if (logic === 'contains') {
			query.where(field.dbField(), 'like', '%' + value + '%');
		}
		else if (logic === 'notContains') {
			query.where(field.dbField(), 'not like', '%' + value + '%');
		}
		else if (logic === 'starts') {
			query.where(field.dbField(), 'like', value + '%');
		}
		else if (logic === 'ends') {
			query.where(field.dbField(), 'like', '%' + value);
		}
	}
}
