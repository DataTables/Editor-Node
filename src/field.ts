
export default class Field {
    private _name: string;
    private _dbField: string;

    constructor( dbField: string=null, name:string=null ) {
        if ( ! dbField && name ) {
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

    public name (): string;
    public name (name: string): Field;
    public name (name?: string): any {
        if ( name === undefined ) {
            return this._name;
        }

        this._name = name;
        return this;
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
}

