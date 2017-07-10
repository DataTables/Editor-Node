
export default function promisify<T>( fn: Function, scope: any = null ): Function {
	return function (...args): Promise<T> {
		return new Promise<T>( function ( resolve: Function, reject: Function ) {
			// Assume the callback handler goes at the end of the arguments
			args.push( function( err: Object, val: any ) {
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
};
