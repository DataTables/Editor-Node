
export interface IFormatter {
    (val: any, data: object): any;
}

export default class Formatter {
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
}