
import * as knex from 'knex';
import Editor from './editor';
import Field from './field';


export interface IValidator {
    (val: any, data: object, host: Host): true|string;
}

export interface HostOpts {
    action: string;
    id: string;
    field: Field;
    editor: Editor;
    db: knex;
}


class Options {

}

class Host {
    public action: string;
    public id: string;
    public field: Field;
    public editor: Editor;
    public db: knex;

    constructor ( opts: HostOpts ) {
        this.action = opts.action;
        this.id = opts.id;
        this.field = opts.field;
        this.editor = opts.editor;
        this.db = opts.db;
    }
}

export default class Validator {
    public static Options = Options;
    public static Host = Host;

    public static numeric ( opts: Options=null, decimal: string='.' ): IValidator {
        // TODO Common validation options
        return function ( val: any, data: object, host: Host ): true|string {
            if ( decimal !== '.' ) {
                val = val.toString().replace(decimal, '.');
            }

            return isNaN( parseFloat( val ) ) ?
                'Not a number' :
                true;
        };
    }
}