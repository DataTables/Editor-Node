
export default class ValidationOptions {
    /**
     * @ignore
     */
    public static select( user: ValidationOptions ): ValidationOptions {
        if ( user ) {
            return user;
        }

        return new ValidationOptions();
    }

    public message: string = "Input not valid";
    public empty: boolean = true;
    public optional: boolean = true;
}
