
/**
 * Wrap an async function which uses a callback for completion in a Promise
 * so it can be used with `await`.
 *
 * @export
 * @template T Return type
 * @param {Function} fn Function to execute
 * @param {*} [scope=null] Scope
 * @returns {Function} Promise wrapper function
 */
export default function promisify<T>( fn: Function, scope: any = null ): Function {
	return function(...args): Promise<T> {
		return new Promise<T>( function( resolve: Function, reject: Function ) {
			// Assume the callback handler goes at the end of the arguments
			args.push( function( err: object, val: any ) {
				// Assume that err is the first argument and value is the second
				if ( err ) {
					reject( err );
				}
				else {
					resolve( val );
				}
			} );

			fn.apply( scope || fn, args );
		} );
	};
}
