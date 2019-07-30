import * as knex from 'knex';

import Editor, {IDtRequest, IDtResponse} from './editor';
import Field from './field';
import NestedData from './nestedData';

interface IJoinTable {
	table?: string;
	parent: string|string[];
	child: string|string[];
}

/**
 * Grouped validation
 */
export type IMjoinValidator =
	( editor: Editor, action: string, data: IDtRequest ) => Promise<true|string>;


/**
 * The MJoin class provides a one-to-many join link for Editor. This can
 * be useful in cases were an attribute can take multiple values at the
 * same time - for example cumulative security access levels.
 *
 * Typically the MJoin class should be used with a link table, but this is
 * optional. Please note that if you don't use a link table you should be
 * aware that on edit the linked rows are deleted and then reinserted, thus
 * if any values should be retained they should also be submitted.
 *
 * Please refer to the Editor Node documentation for further information
 * https://editor.datatables.net/manual/node
 *
 * @export
 * @class Mjoin
 * @extends {NestedData}
 */
export default class Mjoin extends NestedData {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Private parameters
	*/

	private _table: string;
	private _editor: Editor;
	private _name: string;
	private _get: boolean = true;
	private _set: boolean = true;
	private _where: any[] = [];
	private _fields: Field[] = [];
	private _links: string[] = [];
	private _order: string;
	private _join: IJoinTable = {
		child: '',
		parent: ''
	};
	private _validators: Array<{
		fieldName: string,
		fn: IMjoinValidator
	}> = [];

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Creates an instance of Mjoin.
	 *
	 * @param {string} table Table name being joined to
	 */
	constructor( table: string ) {
		super();

		this.table( table );
		this.name( table );
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods
	 */

	/**
	 * Get or field by name, or add a field instance.
	 *
	 * @param {(Field|string)} nameOrField Field instance to add, or field name to get
	 * @returns Mjoin instance if adding a field, Field instance if getting a field.
	 */
	public field( nameOrField: string );
	public field( nameOrField: Field );
	public field( nameOrField: Field|string ) {
		if ( typeof nameOrField === 'string' ) {
			for ( let i = 0, ien = this._fields.length ; i < ien ; i++ ) {
				if ( this._fields[i].name() === nameOrField ) {
					return this._fields[i];
				}
			}

			throw new Error( 'Unknown field: ' + nameOrField );
		}

		this._fields.push( nameOrField );
		return this;
	}

	/**
	 * Get the fields assigned to this instance.
	 * @returns {Field[]} Array of fields
	 */
	public fields(): Field[];
	/**
	 * Add one or more fields to the instance.
	 * @param {...Field[]} fields Fields to add
	 * @returns {Mjoin} Self for chaining
	 */
	public fields(...fields: Field[]): Mjoin;
	public fields(...fields: Field[]): any {
		if ( fields === undefined || fields.length === 0 ) {
			return this._fields;
		}

		this._fields.push.apply( this._fields, fields );

		return this;
	}

	/**
	 * Get the `get` flag for all fields in the Mjoin instance.
	 *
	 * @returns {boolean} True if gettable, false otherwise.
	 */
	public get(): boolean;
	/**
	 * Set the `get` flag for all fields in the Mjoin instance.
	 * When set to false no read operations will occur on the join tables.
	 *
	 * @param {boolean} flag `true` to mark as readable, false otherwise
	 * @returns {Mjoin} Self for chaining
	 */
	public get(flag: boolean): Mjoin;
	public get(flag?: boolean): any {
		if ( flag === undefined ) {
			return this._get;
		}

		this._get = flag;
		return this;
	}

	/**
	 * Create a join link between two tables. The order of the fields does not
	 * matter, but each field must contain the table name as well as the field
	 * name.
	 *
	 * This method can be called a maximum of two times for an Mjoin instance:
	 *
	 * * First time, creates a link between the Editor host table and a join
	 *   table
	 * * Second time creates the links required for a link table.
	 *
	 * Please refer to the Editor Mjoin documentation for further details:
	 * https://editor.datatables.net/manual/php
	 *
	 * @param {string} field1 Table and field name
	 * @param {string} field2 Table and field name
	 * @returns {Mjoin} Self for chaining
	 */
	public link( field1: string, field2: string ): Mjoin {
		if ( field1.indexOf('.') === -1 || field2.indexOf('.') === -1 ) {
			throw new Error( 'Mjoin fields must contain both the table name and the column name' );
		}

		if ( this._links.length === 4 ) {
			throw new Error( 'Mjoin link method cannot be called more than twice for a single instance' );
		}

		// Add to list - it is resolved later on
		this._links.push( field1 );
		this._links.push( field2 );

		return this;
	}

	/**
	 * Get the instance's configured name.
	 *
	 * The `name` of the Join is the JSON property key that is used when
	 * 'getting' the data, and the HTTP property key (in a JSON style) when
	 * 'setting' data. Typically the name of the db table will be used here,
	 * but this method allows that to be overridden.
	 *
	 * @returns {string} Current name.
	 */
	public name(): string;
	/**
	 * Set the instance's name
	 *
	 * @param {string} name Name to set
	 * @returns {Mjoin} Self for chaining
	 */
	public name(name: string): Mjoin;
	public name(name?: string): any {
		if ( name === undefined ) {
			return this._name;
		}

		this._name = name;
		return this;
	}

	/**
	 * Get the column name to order the data by
	 *
	 * @returns {string} SQL column name
	 */
	public order(): string;
	/**
	 * Specify the property that the data will be sorted by.
	 *
	 * @param {string} order SQL column name to order the data by
	 * @returns {Mjoin} Self for chaining
	 */
	public order(order: string): Mjoin;
	public order(order?: string): any {
		if ( order === undefined ) {
			return this._order;
		}

		this._order = order;
		return this;
	}

	/**
	 * Get the current `set` property for the instance.
	 *
	 * When set to false no write operations will occur on the join tables.
	 * This can be useful when you want to display information which is joined,
	 * but want to only perform write operations on the parent table.
	 *
	 * @returns {boolean} Set configuration
	 */
	public set(): boolean;
	/**
	 * Set the instance's set property
	 *
	 * @param {(boolean)} flag Set flag.
	 * @returns {Mjoin} Self for chaining.
	 */
	public set(flag: boolean): Mjoin;
	public set(flag?: boolean): any {
		if ( flag === undefined ) {
			return this._set;
		}

		this._set = flag;
		return this;
	}

	/**
	 * Get join table name.
	 *
	 * Please note that this will also set the {@link name} used by the Join
	 * as well. This is for convenience as the JSON output / HTTP input will
	 * typically use the same name as the database name. If you want to set a
	 * custom name, the {@link name} method must be called ***after*** this one.
	 *
	 * @returns {string} Join table name
	 */
	public table(): string;
	/**
	 * Set column join name
	 *
	 * @param {string} table Join table name
	 * @returns {Mjoin} Self for chaining
	 */
	public table(table: string): Mjoin;
	public table(table?: string): any {
		if ( table === undefined ) {
			return this._table;
		}

		this._table = table;
		return this;
	}

	/**
	 * Set a validator for the array of data (not on a field basis)
	 *
	 * @param fieldName Name of the field that any error should be shown
	 *   against on the client-side
	 * @param fn Callback function for validation
	 */
	public validator( fieldName: string, fn: IMjoinValidator ): this {
		this._validators.push( {
			fieldName,
			fn
		} );

		return this;
	}

	/**
	 * Get the array of conditions applied to the method.
	 *
	 * @returns {any[]} Knex where conditions.
	 */
	public where(): any[];
	/**
	 * Where condition to add to the query used to get data from the database.
	 * Note that this is applied to the child table.
	 *
	 * @param {*} cond Knex query condition
	 * @returns {Mjoin} Self for chaining.
	 */
	public where(cond: any): Mjoin;
	public where(cond?: any): any {
		if ( cond === undefined ) {
			return this._where;
		}

		this._where.push( cond );

		return this;
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Internal methods
	 */

	/**
	 * @ignore
	 */
	public async data( editor: Editor, response: IDtResponse ): Promise<void> {
		if ( ! this._get ) {
			return;
		}

		this._prepare( editor );
		let fields = this.fields();
		let join = this._join;

		// This is something that will likely come in a future version, but it
		// is a relatively low use feature. Please get in touch if this is
		// something you require.
		if ( editor.pkey().length > 1 ) {
			throw new Error( 'Mjoin is not currently supported with a compound primary key for the main table' );
		}

		if ( response.data.length ) {
			// If the Editor primary key is join key, then it is read automatically
			// and into Editor's primary key store
			let dteTable = editor.table()[0];
			let joinField = join.table ?
				join.parent[0] :
				join.parent;
			let dteTableAlias = dteTable.indexOf(' ') !== -1
				? dteTable.split(/ (as )?/i)[2]
				: dteTable;
			let mJoinTable = this._table.indexOf(' ') !== -1
				? this._table.split(/ (as )?/i)[0]
				: this._table;
			let mJoinTableAlias = this._table.indexOf(' ') !== -1
				? this._table.split(/ (as )?/i)[2]
				: this._table;

			let pkeyIsJoin = joinField === editor.pkey()[0] ||
			dteTableAlias + '.' + joinField === editor.pkey()[0];

			// Build the basic query
			let query = editor.db().table( dteTable )
				.distinct( dteTableAlias + '.' + joinField + ' as dteditor_pkey' );

			let order = this.order();
			if ( order ) {
				let a = order.split( ' ' );

				if ( a.length > 1 ) {
					query.orderBy( a[0], a[1] );
				}
				else {
					query.orderBy( a );
				}
			}

			this._applyWhere( query );

			for ( let i = 0, ien = fields.length ; i < ien ; i++ ) {
				let field = fields[i];

				if ( field.apply('get') && field.getValue() === undefined ) {
					let dbField = field.dbField();

					if (dbField.indexOf('(') !== -1 ) {
						query.select( editor.db().raw( dbField + ' as "' + dbField + '"' ) );
					}
					else if ( dbField.indexOf('.') === -1 ) {
						query.select( mJoinTableAlias + '.' + dbField + ' as ' + dbField );
					}
					else {
						query.select( dbField );
					}
				}
			}

			// Create the joins
			if ( join.table ) {
				query.innerJoin( join.table, dteTableAlias + '.' + join.parent[0], '=', join.table + '.' + join.parent[1] );
				query.innerJoin( mJoinTable+' as '+mJoinTableAlias, mJoinTableAlias + '.' + join.child[0], '=', join.table + '.' + join.child[1] );
			}
			else {
				query.innerJoin( mJoinTable+' as '+mJoinTableAlias, mJoinTableAlias + '.' + join.child, '=', dteTableAlias + '.' + join.parent );
			}

			let readField = '';
			if ( this._propExists( dteTableAlias + '.' + joinField, response.data[0] ) ) {
				readField = dteTableAlias + '.' + joinField;
			}
			else if ( this._propExists( joinField.toString(), response.data[0] ) ) {
				readField = joinField.toString();
			}
			else if ( !pkeyIsJoin ) {
				throw new Error(
					'Join was performed on the field "' + readField + '" which was not ' +
					'included in the Editor field list. The join field must be ' +
					'included as a regular field in the Editor instance.'
				);
			}

			// Get list of pkey values and apply as a WHERE IN condition
			// This is primarily useful in server-side processing mode and when filtering
			// the table as it means only a sub-set will be selected
			// This is only applied for "sensible" data sets.172 It will just complicate
			// matters for really large data sets:
			// https://stackoverflow.com/questions/21178390/in-clause-limitation-in-sql-server
			if ( response.data.length < 1000 ) {
				let whereIn = [];
				let data = response.data;

				for ( let i = 0, ien = data.length; i < ien; i++ ) {
					let linkValue = pkeyIsJoin ?
						(data[i] as any).DT_RowId.replace( editor.idPrefix(), '' ) :
						this._readProp( readField, data[i] );

					whereIn.push( linkValue );
				}

				query.whereIn( dteTableAlias + '.' + joinField, whereIn );
			}

			let res = await query;

			// Map the data to the primary key for fast loop up
			let joinMap = {};

			for ( let i = 0, ien = res.length ; i < ien ; i++ ) {
				let inner = {};

				for ( let j = 0, jen = fields.length ; j < jen ; j++ ) {
					fields[j].write( inner, res[i] );
				}

				let lookup = res[i].dteditor_pkey;

				if ( ! joinMap[ lookup ] ) {
					joinMap[ lookup ] = [];
				}

				joinMap[ lookup ].push( inner );
			}

			// Loop over the data in the original response and do a join based on
			// the mapped data
			for ( let i = 0, ien = response.data.length ; i < ien ; i++ ) {
				let data = response.data[i];
				let linkField = pkeyIsJoin ?
					(data as any).DT_RowId.replace( editor.idPrefix(), '' ) :
					this._readProp( readField, data );

				if ( joinMap[ linkField ] ) {
					data[ this._name ] = joinMap[ linkField ];
				}
				else {
					data[ this._name ] = [];
				}
			}
		}

		// Field options
		for ( let i = 0, ien = fields.length ; i < ien ; i++ ) {
			let opts = await fields[i].optionsExec( editor.db() );

			if ( opts ) {
				let name = this.name() + '[].' + fields[i].name();

				response.options[ name ] = opts;
			}
		}
	}

	/**
	 * @ignore
	 */
	public async create( editor: Editor, parentId: string, data: object ): Promise<void> {
		// If not settable, or the many count for the join was not submitted
		// then we do nothing
		if (
			! this._set ||
			! data[ this._name ] ||
			! data[ this._name + '-many-count']
		) {
			return;
		}

		this._prepare( editor );
		let db = editor.db();

		for ( let i = 0, ien = data[ this._name ].length ; i < ien ; i++ ) {
			await this._insert( db, parentId, data[ this._name ][i] );
		}
	}

	/**
	 * @ignore
	 */
	public async update( editor: Editor, parentId: string, data: object ): Promise<void> {
		if ( ! this._set || ! data[ this._name + '-many-count'] ) {
			return;
		}

		// WARNING - this will remove rows and then readd them. Any
		// data not in the field list WILL BE LOST
		await this.remove( editor, [parentId] );
		await this.create( editor, parentId, data );
	}

	/**
	 * @ignore
	 */
	public async remove( editor: Editor, ids: string[] ): Promise<void> {
		if ( ! this._set ) {
			return;
		}

		this._prepare( editor );
		let db = editor.db();
		let join = this._join;

		if ( join.table ) {
			let query = db
				.del()
				.from( join.table );

			for ( let i = 0, ien = ids.length ; i < ien ; i++ ) {
				query.orWhere( { [join.parent[1]]: ids[i] } );
			}

			await query;
		}
		else {
			let query = db
				.del()
				.from( this._table );

			query.where( function() {
				for ( let i = 0, ien = ids.length ; i < ien ; i++ ) {
					query.orWhere( { [join.child.toString()]: ids[i] } );
				}
			} );

			this._applyWhere( query );

			await query;
		}
	}

	/**
	 * @ignore
	 */
	public async validate( errors, editor: Editor, data: object, action: string ): Promise<void> {
		if ( ! this._set ) {
			return;
		}

		this._prepare( editor );
		let joinData = data[ this._name ] || [];

		for ( let j = 0, jen=this._validators.length ; j < jen ; j++ ) {
			let validator = this._validators[j];
			let res = await validator.fn( editor, action, joinData );

			if ( typeof res === 'string' ) {
				errors.push( {
					name: validator.fieldName,
					status: res
				} );
			}
		}

		for ( let i = 0, ien = joinData.length ; i < ien ; i++ ) {
			await this._validateFields( errors, editor, joinData[i], this._name + '[].' );
		}
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */
	private _applyWhere( query: knex.QueryBuilder<any, any> ): void {
		let where = this._where;

		for ( let i = 0, ien = where.length ; i < ien ; i++ ) {
			query.where( where[i] );
		}
	}

	private async _insert( db: knex, parentId: string, data: object ): Promise<void> {
		let join = this._join;
		let fields = this.fields();

		if ( join.table ) {
			// Insert keys into the join table
			await db
				.insert( {
					[join.parent[1]]: parentId,
					[join.child[1]]: data[ join.child[0] ]
				} )
				.from( join.table );
		}
		else {
			// Insert values into the target table
			let set = {
				[join.child.toString()]: parentId
			};

			for ( let i = 0, ien = fields.length ; i < ien ; i++ ) {
				let field = fields[i];

				if ( field.apply('create', data) ) {
					set[ field.dbField() ] = field.val( 'set', data );
				}
			}

			await db
				.insert( set )
				.from( this._table );
		}
	}

	private _prepare( editor: Editor ): void {
		this._editor = editor;

		let links = this._links;
		let editorTable = editor.table()[0];
		let joinTable = this.table();
		let dteTableAlias = editorTable.indexOf(' ') !== -1
			? editorTable.split(/ (as )?/i)[2]
			: editorTable;

		if ( links.length === 2 ) {
			// No link table
			let f1 = links[0].split('.');
			let f2 = links[1].split('.');

			if ( f1[0] === dteTableAlias ) {
				this._join.parent = f1[1];
				this._join.child = f2[1];
			}
			else {
				this._join.parent = f2[1];
				this._join.child = f1[1];
			}
		}
		else {
			// Link table
			let f1 = links[0].split('.');
			let f2 = links[1].split('.');
			let f3 = links[2].split('.');
			let f4 = links[3].split('.');

			// Discover the name of the link table
			if ( f1[0] !== dteTableAlias && f1[0] !== joinTable ) {
				this._join.table = f1[0];
			}
			else if ( f2[0] !== dteTableAlias && f2[0] !== joinTable ) {
				this._join.table = f2[0];
			}
			else if ( f3[0] !== dteTableAlias && f3[0] !== joinTable ) {
				this._join.table = f3[0];
			}
			else {
				this._join.table = f4[0];
			}

			this._join.parent = [ f1[1], f2[1] ];
			this._join.child = [ f3[1], f4[1] ];
		}
	}

	private async _validateFields( errors, editor: Editor, data: object, prefix: string ): Promise<void> {
		let fields = this.fields();

		for ( let i = 0, ien = fields.length ; i < ien ; i++ ) {
			let field = fields[i];
			let validation = await field.validate( data, editor );

			if ( validation !== true ) {
				errors.push( {
					name: prefix + field.name(),
					status: validation
				} );
			}
		}
	}
}
