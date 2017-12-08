"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Information container about the Field and Editor instances
 * for the item being validated.
 *
 * @export
 */
var ValidationHost = /** @class */ (function () {
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Constructor
     */
    /**
     * Creates an instance of ValidationHost.
     *
     * @param {IHostOpts} opts Host information
     */
    function ValidationHost(opts) {
        this.action = opts.action;
        this.id = opts.id;
        this.field = opts.field;
        this.editor = opts.editor;
        this.db = opts.db;
    }
    return ValidationHost;
}());
exports.default = ValidationHost;

//# sourceMappingURL=validationHost.js.map
