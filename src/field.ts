import knex from 'knex';

import Editor from './editor';
import {IFormatter} from './formatters';
import NestedData from './nestedData';
import Options, {CustomOptions, IOption} from './options';
import Upload from './upload';
import Validator, {IValidator} from './validators';
import xss, {Ixss} from './xss';

export enum SetType {
    None,
    Both,
    Create,
    Edit
};

export default class Field extends NestedData {
    private _dbField: string;
    private _get: boolean = true;
    private _getFormatter: IFormatter;
    private _getValue: any;
    private _opts: Options & CustomOptions;
    private _name: string;
    private _set: SetType = SetType.Both;
    private _setFormatter: IFormatter;
    private _setValue: any;
    private _validator: IValidator[] = [];
    private _upload: Upload;
    private _xss: Ixss;
    private _xssFormat: boolean = true;


    constructor( dbField: string=null, name:string=null ) {
        super();

        if ( ! name && dbField ) {
            // Standard usage, a single parameter
            this
                .name( dbField )
                .dbField( dbField );
        }
        else {
            this
                .name( name )
                .dbField( dbField );
        }
    }

    public dbField (): string;
    public dbField (dbField: string): Field;
    public dbField (dbField?: string): any {
        if ( dbField === undefined ) {
            return this._dbField;
        }

        this._dbField = dbField;
        return this;
    }

    public get (): boolean;
    public get (flag: boolean): Field;
    public get (flag?: boolean): any {
        if ( flag === undefined ) {
            return this._get;
        }

        this._get = flag;
        return this;
    }

    public getFormatter (): IFormatter;
    public getFormatter (formatter: IFormatter): Field;
    public getFormatter (formatter?: IFormatter): any {
        if ( formatter === undefined ) {
            return this._getFormatter;
        }

        this._getFormatter = formatter;
        return this;
    }

    public getValue (): any;
    public getValue (val: any): Field;
    public getValue (val?: any): any {
        if ( val === undefined ) {
            return this._getValue;
        }

        this._getValue = val;
        return this;
    }

    public name (): string;
    public name (name: string): Field;
    public name (name?: string): any {
        if ( name === undefined ) {
            return this._name;
        }

        this._name = name;
        return this;
    }


    public options (): Options & CustomOptions;
    public options (opts: Options & CustomOptions): Field;
    public options (opts?: Options & CustomOptions): any {
        if ( opts === undefined ) {
            return this._opts;
        }

        this._opts = opts;
        return this;
    }


    public set (): SetType;
    public set (flag: boolean|SetType): Field;
    public set (flag?: boolean): any {
        if ( flag === undefined ) {
            return this._set;
        }

        if ( flag === true ) {
            this._set = SetType.Both;
        }
        else if ( flag === false ) {
            this._set = SetType.None;
        }
        else {
            this._set = flag;
        }

        return this;
    }

    public setFormatter (): IFormatter;
    public setFormatter (formatter: IFormatter): Field;
    public setFormatter (formatter?: IFormatter): any {
        if ( formatter === undefined ) {
            return this._setFormatter;
        }

        this._setFormatter = formatter;
        return this;
    }

    public setValue (): any;
    public setValue (val: any): Field;
    public setValue (val?: any): any {
        if ( val === undefined ) {
            return this._setValue;
        }

        this._setValue = val;
        return this;
    }

    public upload (): Upload;
    public upload (upload: Upload): Field;
    public upload (upload?: Upload): any {
        if ( upload === undefined ) {
            return this._upload;
        }

        this._upload = upload;
        return this;
    }

    public validator (): any;
    public validator (validator: IValidator): Field;
    public validator (validator?: IValidator): any {
        if ( validator === undefined ) {
            return this._validator;
        }

        this._validator.push( validator );
        return this;
    }

    public xss (): any;
    public xss (flag: boolean|Ixss): Field;
    public xss (flag?: boolean|Ixss): any {
        if ( flag === undefined ) {
            return this._xss;
        }

        if ( flag === true ) {
            this._xss = xss;
        }
        else if ( flag === false ) {
            this._xss = null;
        }
        else {
            this._xss = flag;
        }

        return this;
    }

    

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Internal methods
	 * Used by the Editor class and not generally for public use
	 */
    public apply( action: 'get'|'create'|'edit', data?: object ): boolean {
        if ( action === 'get' ) {
            return this._get;
        }

        if ( action === 'create' && (this._set === SetType.None || this._set === SetType.Edit)) {
            return false;
        }
        else if ( action === 'edit' && (this._set === SetType.None || this._set === SetType.Create)) {
            return false;
        }

        // Check it was in the submitted data
        if ( this._setValue === undefined && ! this._propExists( this.name(), data ) ) {
            return false;
        }

        // In the data set, so use it
        return true;
    }


    public async optionsExec ( db: knex ): Promise<false|IOption[]> {
        if ( this._opts instanceof Options ) {
            return await this._opts.exec( db );
        }
        else if ( this._opts ) {
            return await this._opts( db );
        }
        return false;
    }


    public val( direction: 'get'|'set', data: object ): any {
        let val;

        if ( direction === 'get' ) {
            if ( this._getValue !== undefined ) {
                val = typeof this._getValue === 'function' ?
                    this._getValue() :
                    this._getValue;
            }
            else {
                // Getting data, so db field name
                val = data[ this._dbField ] !== undefined ?
                    data[ this._dbField ] :
                    null;
            }

            return this._format( val, data, this._getFormatter );
        }
        
        // set - using from the payload, and thus use `name`
        if ( this._setValue !== undefined ) {
            val = typeof this._setValue === 'function' ?
                this._setValue() :
                this._setValue;
        }
        else {
            val = this._readProp( this._name, data );
        }

        return this._format( val, data, this._setFormatter );
    }

    public async validate ( data: object, editor: Editor, id: string=null ): Promise<true|string> {
        if ( this._validator.length === 0 ) {
            return true;
        }
        
        let val = this._readProp( this.name(), data );
        let host = new Validator.Host( {
            action: editor.inData()['action'],
            id,
            field: this,
            editor,
            db: editor.db()
        } );

        for ( let i=0, ien=this._validator.length ; i<ien ; i++ ) {
            let validator = this._validator[i];
            let res = await validator( val, data, host );

            if ( res !== true ) {
                return res;
            }
        }

        // Calidation methods all run, must be value
        return true;
    }
    
    public write( out: object, srcData: object ): void {
        this._writeProp( out, this.name(), this.val('get', srcData) );
    }

    public xssSafety ( val: any ) {
        if ( ! this._xss ) {
            return val;
        }

        if ( Array.isArray( val ) ) {
            let out = [];

            for ( let i=0, ien=val.length ; i<ien ; i++ ) {
                out.push( this._xss( val[i] ) );
            }

            return out;
        }

        return this._xss( val );
    }


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

    private _format( val: any, data: object, formatter: IFormatter ): any {
        return formatter ?
            formatter( val, data ) :
            val;
    }
}

