

export default class NestedData {
    protected _propExists( name: string, data: object ): boolean {
        if ( name.indexOf('.') === -1 ) {
            return data[ name ] === undefined ?
                false :
                true;
        }

        let names = name.split('.');
        let inner = data;

        for ( let i=0, ien=names.length-1 ; i<ien ; i++ ) {
            if ( inner[ names[i] ] === undefined ) {
                return false;
            }

            inner = inner[ names[i] ];
        }

        return inner[ names[names.length-1] ] === undefined ?
            false :
            true;
    }


    protected _readProp( name: string, data: object ): any {
        if ( name.indexOf('.') === -1 ) {
            return data[ name ] !== undefined ?
                data[ name ] :
                null;
        }

        let names = name.split('.');
        let inner = data;

        for ( let i=0, ien=names.length-1 ; i<ien ; i++ ) {
            if ( inner[ names[i] ] === undefined ) {
                return false;
            }

            inner = inner[ names[i] ];
        }

        let idx = names[names.length-1];
        return inner[ idx ] !== undefined ?
            inner[ idx ] :
            null;
    }


    protected _writeProp( out: object, name: string, value: any ): void {
        if ( name.indexOf('.') === -1 ) {
            out[ name ] = value;
            return;
        }

        let names = name.split('.');
        let inner = out;

        for ( let i=0, ien=names.length ; i<ien ; i++ ) {
            let loopName = names[i];

            if ( inner[ loopName ] === undefined ) {
                inner[ loopName ] = [];
            }
            else if ( inner[ loopName ] !== 'object' ) {
                throw new Error('A property with the name `'+name+'` already exists. '+
					'This can occur if you have properties which share a prefix - '+
					'for example `name` and `name.first`.'
                );
            }

            inner = inner[ loopName ];
        }

        let idx = names[ names.length-1 ];

        if ( inner[ idx ] !== undefined ) {
            throw new Error( 'Duplicate field deletected - a field with the name '+
                '`'+name+'` already exists'
            );
        }
        
        inner[ idx ] = value;
    }
}
