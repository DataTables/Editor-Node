export default class NestedData {
    protected _propExists(name: string, data: object): boolean;
    protected _readProp(name: string, data: object): any;
    protected _writeProp(out: object, name: string, value: any): void;
}
