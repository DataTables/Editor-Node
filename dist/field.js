"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var nestedData_1 = require("./nestedData");
var options_1 = require("./options");
var validators_1 = require("./validators");
var xss_1 = require("./xss");
/**
 * Set types
 * @export
 */
var SetType;
(function (SetType) {
    /** Do not set data */
    SetType[SetType["None"] = 0] = "None";
    /** Write to database on both create and edit */
    SetType[SetType["Both"] = 1] = "Both";
    /** Write to the database only on create */
    SetType[SetType["Create"] = 2] = "Create";
    /** Write to the database only on edit */
    SetType[SetType["Edit"] = 3] = "Edit";
})(SetType = exports.SetType || (exports.SetType = {}));
/**
 * Field definitions for the DataTables Editor.
 *
 * Each Database column that is used with Editor can be described with this
 * Field method (both for Editor and Join instances). It basically tells
 * Editor what table column to use, how to format the data and if you want
 * to read and/or write this column.
 *
 * Field instances are used with the {@link Editor.field} and
 * {@link Mjoin.field} methods to describe what fields should be interacted
 * with by the editable table.
 *
 * @export
 * @class Field
 * @extends {NestedData}
 */
var Field = /** @class */ (function (_super) {
    __extends(Field, _super);
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Constructor
     */
    /**
     * Creates an instance of Field.
     *
     * @param {string} [dbField=null] Name of the database column
     * @param {string} [name=null] Name to use in the JSON output from Editor and the
     *   HTTP submit from the client-side when editing. If not given then the
     *   `dbField` name is used.
     */
    function Field(dbField, name) {
        if (dbField === void 0) { dbField = null; }
        if (name === void 0) { name = null; }
        var _this = _super.call(this) || this;
        _this._get = true;
        _this._set = SetType.Both;
        _this._validator = [];
        _this._xssFormat = true;
        if (!name && dbField) {
            // Standard usage, a single parameter
            _this
                .name(dbField)
                .dbField(dbField);
        }
        else {
            _this
                .name(name)
                .dbField(dbField);
        }
        return _this;
    }
    Field.prototype.dbField = function (dbField) {
        if (dbField === undefined) {
            return this._dbField;
        }
        this._dbField = dbField;
        return this;
    };
    Field.prototype.get = function (flag) {
        if (flag === undefined) {
            return this._get;
        }
        this._get = flag;
        return this;
    };
    Field.prototype.getFormatter = function (formatter) {
        if (formatter === undefined) {
            return this._getFormatter;
        }
        this._getFormatter = formatter;
        return this;
    };
    Field.prototype.getValue = function (val) {
        if (val === undefined) {
            return this._getValue;
        }
        this._getValue = val;
        return this;
    };
    Field.prototype.name = function (name) {
        if (name === undefined) {
            return this._name;
        }
        this._name = name;
        return this;
    };
    Field.prototype.options = function (opts) {
        if (opts === undefined) {
            return this._opts;
        }
        this._opts = opts;
        return this;
    };
    Field.prototype.set = function (flag) {
        if (flag === undefined) {
            return this._set;
        }
        if (flag === true) {
            this._set = SetType.Both;
        }
        else if (flag === false) {
            this._set = SetType.None;
        }
        else {
            this._set = flag;
        }
        return this;
    };
    Field.prototype.setFormatter = function (formatter) {
        if (formatter === undefined) {
            return this._setFormatter;
        }
        this._setFormatter = formatter;
        return this;
    };
    Field.prototype.setValue = function (val) {
        if (val === undefined) {
            return this._setValue;
        }
        this._setValue = val;
        return this;
    };
    Field.prototype.upload = function (upload) {
        if (upload === undefined) {
            return this._upload;
        }
        this._upload = upload;
        return this;
    };
    Field.prototype.validator = function (validator) {
        if (validator === undefined) {
            return this._validator;
        }
        this._validator.push(validator);
        return this;
    };
    Field.prototype.xss = function (flag) {
        if (flag === undefined) {
            return this._xss;
        }
        if (flag === true) {
            this._xss = xss_1.default;
        }
        else if (flag === false) {
            this._xss = null;
        }
        else {
            this._xss = flag;
        }
        return this;
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Internal methods
     * Used by the Editor class and not generally for public use
     */
    /**
     * @hidden
     */
    Field.prototype.apply = function (action, data) {
        if (action === 'get') {
            return this._get;
        }
        if (action === 'create' && (this._set === SetType.None || this._set === SetType.Edit)) {
            return false;
        }
        else if (action === 'edit' && (this._set === SetType.None || this._set === SetType.Create)) {
            return false;
        }
        // Check it was in the submitted data
        if (this._setValue === undefined && !this._propExists(this.name(), data)) {
            return false;
        }
        // In the data set, so use it
        return true;
    };
    /**
     * @hidden
     */
    Field.prototype.optionsExec = function (db) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this._opts instanceof options_1.default)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._opts.exec(db)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!this._opts) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._opts(db)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * @hidden
     */
    Field.prototype.val = function (direction, data) {
        var val;
        if (direction === 'get') {
            if (this._getValue !== undefined) {
                val = typeof this._getValue === 'function' ?
                    this._getValue() :
                    this._getValue;
            }
            else {
                // Getting data, so db field name
                val = data[this._dbField] !== undefined ?
                    data[this._dbField] :
                    null;
            }
            return this._format(val, data, this._getFormatter);
        }
        // set - using from the payload, and thus use `name`
        if (this._setValue !== undefined) {
            val = typeof this._setValue === 'function' ?
                this._setValue() :
                this._setValue;
        }
        else {
            val = this._readProp(this._name, data);
        }
        return this._format(val, data, this._setFormatter);
    };
    /**
     * @hidden
     */
    Field.prototype.validate = function (data, editor, id) {
        if (id === void 0) { id = null; }
        return __awaiter(this, void 0, void 0, function () {
            var val, host, i, ien, validator, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._validator.length === 0) {
                            return [2 /*return*/, true];
                        }
                        val = this._readProp(this.name(), data);
                        host = new validators_1.default.Host({
                            action: editor.inData().action,
                            db: editor.db(),
                            editor: editor,
                            field: this,
                            id: id
                        });
                        i = 0, ien = this._validator.length;
                        _a.label = 1;
                    case 1:
                        if (!(i < ien)) return [3 /*break*/, 4];
                        validator = this._validator[i];
                        return [4 /*yield*/, validator(val, data, host)];
                    case 2:
                        res = _a.sent();
                        if (res !== true) {
                            return [2 /*return*/, res];
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: 
                    // Validation methods all run, must be value
                    return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * @hidden
     */
    Field.prototype.write = function (out, srcData) {
        this._writeProp(out, this.name(), this.val('get', srcData));
    };
    /**
     * @hidden
     */
    Field.prototype.xssSafety = function (val) {
        if (!this._xss) {
            return val;
        }
        if (Array.isArray(val)) {
            var out = [];
            for (var i = 0, ien = val.length; i < ien; i++) {
                out.push(this._xss(val[i]));
            }
            return out;
        }
        return this._xss(val);
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Private methods
     */
    Field.prototype._format = function (val, data, formatter) {
        return formatter ?
            formatter(val, data) :
            val;
    };
    Field.SetType = SetType;
    return Field;
}(nestedData_1.default));
exports.default = Field;

//# sourceMappingURL=field.js.map
