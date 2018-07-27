
/**
 * Class that provides methods to read and write from nested JSON objects,
 * using dot notation strings for the nesting. This class should be extended
 * by any wishing to use these abilities.
 * @export
 * @class NestedData
 */
export default class NestedData {
	/**
	 * @hidden
	 * Check if a nested property exists in a data set.
	 * @protected
	 * @param {string} name Property name
	 * @param {object} data Data set to check
	 * @returns {boolean} `true` if present, `false` otherwise
	 */
	protected _propExists( name: string, data: object ): boolean {
		if (data === undefined) {
		  return false;
		}
		if ( name.indexOf('.') === -1 ) {
			return data[ name ] === undefined ?
				false :
				true;
		}

		let names = name.split('.');
		let inner = data;

		for ( let i = 0, ien = names.length - 1; i < ien; i++ ) {
			if ( inner[ names[i] ] === undefined ) {
				return false;
			}

			inner = inner[ names[i] ];
		}

		return inner[ names[names.length - 1] ] === undefined ?
			false :
			true;
	}

	/**
	 * @hidden
	 * Get a nested property value.
	 * @protected
	 * @param {string} name Property name
	 * @param {object} data Data set to check
	 * @returns {*} Value
	 */
	protected _readProp( name: string, data: object ): any {
		if ( name.indexOf('.') === -1 ) {
			return data[ name ] !== undefined ?
				data[ name ] :
				null;
		}

		let names = name.split('.');
		let inner = data;

		for ( let i = 0, ien = names.length - 1; i < ien; i++ ) {
			if ( inner[ names[i] ] === undefined ) {
				return false;
			}

			inner = inner[ names[i] ];
		}

		let idx = names[names.length - 1];
		return inner[ idx ] !== undefined ?
			inner[ idx ] :
			null;
	}

	/**
	 * @hidden
	 * Write a value to a nested data object.
	 * @protected
	 * @param {object} out Data object to write the value into
	 * @param {string} name Nested property name to write to
	 * @param {*} value Value to write
	 * @returns {void} No return.
	 */
	protected _writeProp( out: object, name: string, value: any ): void {
		if ( name.indexOf('.') === -1 ) {
			out[ name ] = value;
			return;
		}

		let names = name.split('.');
		let inner = out;

		for ( let i = 0, ien = names.length - 1; i < ien; i++ ) {
			let loopName = names[i];

			if ( inner[ loopName ] === undefined ) {
				inner[ loopName ] = {};
			}
			else if ( typeof inner[ loopName ] !== 'object' ) {
				throw new Error('A property with the name `' + name + '` already exists. ' +
					'This can occur if you have properties which share a prefix - ' +
					'for example `name` and `name.first`.'
				);
			}

			inner = inner[ loopName ];
		}

		let idx = names[ names.length - 1 ];

		if ( inner[ idx ] !== undefined ) {
			throw new Error( 'Duplicate field detected - a field with the name ' +
				'`' + name + '` already exists'
			);
		}

		inner[ idx ] = value;
	}
}
