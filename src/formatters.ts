import * as moment from 'moment';

export interface IFormatter {
    (val: any, data: object): any;
}

export default class Formatter {
    public static sqlDateToFormat ( format: string ): IFormatter {
        return function (val: any, data: object ) {
            return moment( val, 'YYYY-MM-DD' ).format( format );
        };
    }

    public static formatToSqlDate ( format: string ): IFormatter {
        return function (val: any, data: object ) {
            return moment( val, format ).format( 'YYYY-MM-DD' );
        };
    }

    public static dateTime ( from: string, to: string ): IFormatter {
        return function (val: any, data: object ) {
            return moment( val, from ).format( to );
        };
    }

    public static explode ( delimiter: string = '|' ): IFormatter {
        return function (val: any, data: object ) {
            return val.toString().split( delimiter );
        };
    }

    public static implode ( delimiter: string = '|' ): IFormatter {
        return function (val: any, data: object ) {
            return val.join( delimiter );
        };
    }

    public static ifEmpty ( emptyValue: any ): IFormatter {
        return function (val: any, data: object ) {
            return val === '' ?
                emptyValue :
                val;
        };
    }

    public static fromDecimalChar ( char: string=',' ): IFormatter {
        return function (val: any, data: object ) {
            return val.replace( char, '.' );
        };
    }

    public static toDecimalChar ( char: string=',' ): IFormatter {
        return function (val: any, data: object ) {
            return val.replace( '.', char );
        };
    }
}