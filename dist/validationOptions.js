"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var nestedData_1 = require("./nestedData");
/**
 * Common validation options that can be specified for all validation methods.
 *
 * @export
 * @class ValidationOptions
 */
var ValidationOptions = /** @class */ (function (_super) {
    __extends(ValidationOptions, _super);
    /**
     * Create validation options
     *
     * @param options Options
     */
    function ValidationOptions(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this._dependsField = null;
        _this._dependsValue = null;
        _this._dependsFn = null;
        _this._empty = true;
        _this._message = 'Input not valid';
        _this._optional = true;
        if (options.message !== undefined) {
            _this.message(options.message);
        }
        if (options.empty !== undefined) {
            _this.empty(options.empty);
        }
        if (options.optional !== undefined) {
            _this.optional(options.optional);
        }
        return _this;
    }
    ValidationOptions.prototype.dependsOn = function (field, value) {
        if (value === void 0) { value = null; }
        if (typeof field === 'function') {
            this._dependsFn = field;
        }
        else {
            this._dependsField = field;
            this._dependsValue = value;
        }
        return this;
    };
    ValidationOptions.prototype.empty = function (set) {
        if (set === undefined) {
            return this._empty;
        }
        this._empty = set;
        return this;
    };
    ValidationOptions.prototype.message = function (msg) {
        if (msg === undefined) {
            return this._message;
        }
        this._message = msg;
        return this;
    };
    ValidationOptions.prototype.optional = function (set) {
        if (set === undefined) {
            return this._optional;
        }
        this._optional = set;
        return this;
    };
    /**
     * @ignore internal
     */
    ValidationOptions.prototype.runDepends = function (val, data, host) {
        if (this._dependsFn) {
            // External function - call it
            return this._dependsFn(val, data, host);
        }
        else if (this._dependsField) {
            // Get the value that was submitted for the dependent field
            var depFieldVal = this._readProp(this._dependsField, data);
            if (this._dependsValue !== null) {
                // Field and value
                return Array.isArray(this._dependsValue)
                    ? this._dependsValue.includes(depFieldVal)
                    : depFieldVal === this._dependsValue;
            }
            // Just a field - check that the field has a value
            return depFieldVal !== null && depFieldVal !== '';
        }
        // Default is to apply the validator
        return true;
    };
    /**
     * @ignore internal
     */
    ValidationOptions.select = function (user) {
        if (user) {
            return user;
        }
        return new ValidationOptions();
    };
    return ValidationOptions;
}(nestedData_1.default));
exports.default = ValidationOptions;

//# sourceMappingURL=validationOptions.js.map
