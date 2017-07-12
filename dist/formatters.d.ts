export interface IFormatter {
    (val: any, data: object): any;
}
export default class Formatter {
    static sqlDateToFormat(format: string): IFormatter;
    static formatToSqlDate(format: string): IFormatter;
    static dateTime(from: string, to: string): IFormatter;
    static explode(delimiter?: string): IFormatter;
    static implode(delimiter?: string): IFormatter;
    static ifEmpty(emptyValue: any): IFormatter;
    static fromDecimalChar(char?: string): IFormatter;
    static toDecimalChar(char?: string): IFormatter;
}
