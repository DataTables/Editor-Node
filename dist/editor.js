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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.Action = void 0;
var crc = require("crc");
var field_1 = require("./field");
var nestedData_1 = require("./nestedData");
var helpers_1 = require("./helpers");
/**
 * Action that has been requested by the client-side
 * (based on the `action` parameter).
 * @export
 */
var Action;
(function (Action) {
    /** Get data (used by DataTables). */
    Action[Action["Read"] = 0] = "Read";
    /** Create a new row. */
    Action[Action["Create"] = 1] = "Create";
    /** Edit one or more rows. */
    Action[Action["Edit"] = 2] = "Edit";
    /** Delete one or more rows. */
    Action[Action["Delete"] = 3] = "Delete";
    /** Upload a file. */
    Action[Action["Upload"] = 4] = "Upload";
    /** Search for an option */
    Action[Action["Search"] = 5] = "Search";
})(Action = exports.Action || (exports.Action = {}));
/**
 * This function constructs the queries that are required to implement SearchBuilder filtering
 * It is given as a function rather than a method so that the scope of the function can be set to the correct query
 *
 * @param sbData The criteria that has to have conditions created for it
 * @returns The new query with added where conditions
 */
var _constructSearchBuilderQuery = function (sbData) {
    // The first where condition has to be a normal where rather than an orwhere.
    // Therefore we have to track that we have added a where condition before
    // there is an attempt to create a new orwhere
    var first = true;
    var _loop_1 = function (crit) {
        // If criteria is defined then this must be a group
        if (crit.criteria !== undefined) {
            // Check if this is the first, or if it is and logic
            if (sbData.logic === 'AND' || first) {
                // Call the function for the next group
                this_1.where(function (q) { return _constructSearchBuilderQuery.apply(q, [crit]); });
                // Set first to false so that in future only the logic is checked
                first = false;
            }
            else {
                // Call the function for the next group, OR logic in this block
                this_1.orWhere(function (q) { return _constructSearchBuilderQuery.apply(q, [crit]); });
            }
        }
        else if (crit.condition !== undefined && (crit.value1 !== undefined || crit.condition === "null" || crit.condition === "!null")) {
            var val1_1 = crit.value1;
            var val2_1 = crit.value2;
            if ((val1_1 === undefined || val1_1.length === 0) && crit.condition !== "null" && crit.condition !== "!null") {
                return "continue";
            }
            if ((val2_1 === undefined || val2_1.length === 0) && (crit.condition === "between" || crit.condition === "!between")) {
                return "continue";
            }
            // Switch on the condition that has been passed in
            switch (crit.condition) {
                case '=':
                    // Check if this is the first, or if it is and logic
                    if (sbData.logic === 'AND' || first) {
                        // Call the where function for this condition
                        this_1.where(crit.origData, val1_1);
                        // Set first to false so that in future only the logic is checked
                        first = false;
                    }
                    else {
                        // Call the orWhere function - has to be or logic in this block
                        this_1.orWhere(crit.origData, val1_1);
                    }
                    break;
                case '!=':
                    if (sbData.logic === 'AND' || first) {
                        this_1.whereNot(crit.origData, val1_1);
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.whereNot(crit.origData, val1_1); });
                    }
                    break;
                case 'contains':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(crit.origData, 'LIKE', '%' + val1_1 + '%');
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.where(crit.origData, 'LIKE', '%' + val1_1 + '%'); });
                    }
                    break;
                case '!contains':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(crit.origData, 'NOT LIKE', '%' + val1_1 + '%');
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.where(crit.origData, 'LIKE', '%' + val1_1 + '%'); });
                    }
                    break;
                case 'starts':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(crit.origData, 'LIKE', val1_1 + '%');
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.where(crit.origData, 'LIKE', val1_1 + '%'); });
                    }
                    break;
                case '!starts':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(crit.origData, 'NOT LIKE', val1_1 + '%');
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.where(crit.origData, 'LIKE', val1_1 + '%'); });
                    }
                    break;
                case 'ends':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(crit.origData, 'LIKE', '%' + val1_1);
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.where(crit.origData, 'LIKE', '%' + val1_1); });
                    }
                    break;
                case '!ends':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(crit.origData, 'NOT LIKE', '%' + val1_1);
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.where(crit.origData, 'LIKE', '%' + val1_1); });
                    }
                    break;
                case '<':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(crit.origData, '<', val1_1);
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.where(crit.origData, '<', val1_1); });
                    }
                    break;
                case '<=':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(crit.origData, '<=', val1_1);
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.where(crit.origData, '<=', val1_1); });
                    }
                    break;
                case '>=':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(crit.origData, '>=', val1_1);
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.where(crit.origData, '>=', val1_1); });
                    }
                    break;
                case '>':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(crit.origData, '>', val1_1);
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.where(crit.origData, '>', val1_1); });
                    }
                    break;
                case 'between':
                    if (sbData.logic === 'AND' || first) {
                        this_1.whereBetween(crit.origData, [isNaN(val1_1) ? val1_1 : +val1_1, isNaN(val2_1) ? val2_1 : +val2_1]);
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.whereBetween(crit.origData, [isNaN(val1_1) ? val1_1 : +val1_1, isNaN(val2_1) ? val2_1 : +val2_1]); });
                    }
                    break;
                case '!between':
                    if (sbData.logic === 'AND' || first) {
                        this_1.whereNotBetween(crit.origData, [isNaN(val1_1) ? val1_1 : +val1_1, isNaN(val2_1) ? val2_1 : +val2_1]);
                        first = false;
                    }
                    else {
                        this_1.orWhere(function (q) { return q.whereNotBetween(crit.origData, [isNaN(val1_1) ? val1_1 : +val1_1, isNaN(val2_1) ? val2_1 : +val2_1]); });
                    }
                    break;
                case 'null':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(function (q) {
                            q.whereNull(crit.origData);
                            if (!crit.type.includes('date') && !crit.type.includes('moment') && !crit.type.includes('luxon')) {
                                q.orWhere(crit.origData, "");
                            }
                        });
                        first = false;
                    }
                    else {
                        this_1.where(function (q) {
                            q.orWhere(function (q) { return q.whereNull(crit.origData); });
                            if (!crit.type.includes('date') && !crit.type.includes('moment') && !crit.type.includes('luxon')) {
                                q.orWhere(function (q) { return q.where(crit.origData, ""); });
                            }
                        }, 'OR');
                    }
                    break;
                case '!null':
                    if (sbData.logic === 'AND' || first) {
                        this_1.where(function (q) {
                            q.whereNotNull(crit.origData);
                            if (!crit.type.includes('date') && !crit.type.includes('moment') && !crit.type.includes('luxon')) {
                                q.whereNot(crit.origData, "");
                            }
                        });
                        first = false;
                    }
                    else {
                        this_1.where(function (q) {
                            q.orWhere(function (q) { return q.whereNotNull(crit.origData); });
                            if (!crit.type.includes('date') && !crit.type.includes('moment') && !crit.type.includes('luxon')) {
                                q.orWhere(function (q) { return q.whereNot(crit.origData, ""); });
                            }
                        }, 'OR');
                    }
                    break;
                default:
                    break;
            }
        }
    };
    var this_1 = this;
    // Iterate over every group or criteria in the current group
    for (var _i = 0, _a = sbData.criteria; _i < _a.length; _i++) {
        var crit = _a[_i];
        _loop_1(crit);
    }
    return this;
};
/**
 * DataTables Editor base class for creating editable tables.
 *
 * Editor class instances are capable of servicing all of the requests that
 * DataTables and Editor will make from the client-side - specifically:
 *
 * * Get data
 * * Create new record
 * * Edit existing record
 * * Delete existing records
 *
 * The Editor instance is configured with information regarding the
 * database table fields that you which to make editable, and other information
 * needed to read and write to the database (table name for example!).
 *
 * This documentation is very much focused on describing the API presented
 * by these DataTables Editor classes. For a more general overview of how
 * the Editor class is used, and how to install Editor on your server, please
 * refer to the {@link http://editor.datatables.net/manual Editor manual}.
 *
 * @export
 * @class Editor
 * @extends {NestedData}
 */
var Editor = /** @class */ (function (_super) {
    __extends(Editor, _super);
    /**
     * Creates an instance of Editor.
     * @param {knex} [db=null] Database connection object
     * @param {(string|string[])} [table=null] The table name in the database to
     *   read and write information from and to. Can be given here or with the
     *   'table' method.
     * @param {(string|string[])} [pkey=null] Primary key column name in the
     *   table given in
     */
    function Editor(db, table, pkey) {
        if (db === void 0) { db = null; }
        if (table === void 0) { table = null; }
        if (pkey === void 0) { pkey = null; }
        var _this = _super.call(this) || this;
        _this._fields = [];
        _this._idPrefix = 'row_';
        _this._join = [];
        _this._pkey = ['id'];
        _this._table = [];
        _this._readTableNames = [];
        _this._transaction = false;
        _this._where = [];
        _this._leftJoin = [];
        _this._out = {};
        _this._events = [];
        _this._validators = [];
        _this._validatorsAfterFields = [];
        _this._tryCatch = false;
        _this._debug = false;
        _this._debugInfo = [];
        _this._leftJoinRemove = false;
        _this._schema = null;
        _this._write = true;
        _this._doValidate = true;
        _this._customGet = null;
        if (db) {
            _this.db(db);
        }
        if (table) {
            _this.table(table);
        }
        if (pkey) {
            _this.pkey(pkey);
        }
        return _this;
    }
    /**
     * Determine the request type from an HTTP request.
     *
     * @static
     * @param {IDtRequest} http HTTP request - normally `request.body`. Note that
     *   if you are using `body-parser` you should use `{ extended: true }` as its
     *   options to ensure that nested properties are correctly resolved.
     * @returns {Action} Indicates what action the request is
     */
    Editor.action = function (http) {
        if (!http || !http.action) {
            return Action.Read;
        }
        switch (http.action) {
            case 'create':
                return Action.Create;
            case 'edit':
                return Action.Edit;
            case 'remove':
                return Action.Delete;
            case 'upload':
                return Action.Upload;
            case 'search':
                return Action.Search;
            default:
                throw new Error('Unknown Editor action: ' + http.action);
        }
    };
    /**
     * Get the data constructed in this instance.
     * @returns {IDtResponse} Data object
     */
    Editor.prototype.data = function () {
        return this._out;
    };
    Editor.prototype.db = function (db) {
        if (db === undefined) {
            if (this._knexTransaction) {
                return this._schema
                    ? this._knexTransaction.withSchema(this._schema)
                    : this._knexTransaction;
            }
            else if (this._schema) {
                return this._db.withSchema(this._schema);
            }
            else {
                return this._db;
            }
        }
        this._db = db;
        return this;
    };
    /** Get the current transaction */
    Editor.prototype.dbTransaction = function () {
        return this._knexTransaction;
    };
    Editor.prototype.debug = function (param) {
        if (param === undefined) {
            return this._debug;
        }
        else if (param === true || param === false) {
            this._debug = param;
            return this;
        }
        // Otherwise its a message
        this._debugInfo.push(param);
        return this;
    };
    Editor.prototype.doValidate = function (doValidate) {
        if (doValidate === undefined) {
            return this._doValidate;
        }
        this._doValidate = doValidate;
        return this;
    };
    Editor.prototype.field = function (nameOrField) {
        if (typeof nameOrField === 'string') {
            for (var i = 0, ien = this._fields.length; i < ien; i++) {
                if (this._fields[i].name() === nameOrField) {
                    return this._fields[i];
                }
            }
            throw new Error('Unknown field: ' + nameOrField);
        }
        this._fields.push(nameOrField);
        return this;
    };
    Editor.prototype.fields = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        if (fields === undefined || fields.length === 0) {
            return this._fields;
        }
        this._fields.push.apply(this._fields, fields);
        return this;
    };
    Editor.prototype.get = function (fn) {
        this._customGet = fn;
        return this;
    };
    Editor.prototype.idPrefix = function (idPrefix) {
        if (idPrefix === undefined) {
            return this._idPrefix;
        }
        this._idPrefix = idPrefix;
        return this;
    };
    /**
     * Get the data that is being processed by the Editor instance. This is only
     * useful once the `process()` method has been called, and is available for
     * use in validation and formatter methods.
     * @returns {IDtRequest} Data that has been passed into {@link Editor.process()}
     */
    Editor.prototype.inData = function () {
        return this._processData;
    };
    Editor.prototype.join = function () {
        var join = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            join[_i] = arguments[_i];
        }
        if (join === undefined || join.length === 0) {
            return this._join;
        }
        this._join.push.apply(this._join, join);
        return this;
    };
    Editor.prototype.leftJoin = function (table, field1, operator, field2) {
        if (operator === void 0) { operator = undefined; }
        if (field2 === void 0) { field2 = undefined; }
        if (typeof field1 === 'function') {
            this._leftJoin.push({
                field1: '',
                field2: '',
                fn: field1,
                operator: '',
                table: table,
            });
        }
        else {
            this._leftJoin.push({
                field1: field1,
                field2: field2,
                operator: operator,
                table: table,
            });
        }
        return this;
    };
    Editor.prototype.leftJoinRemove = function (remove) {
        if (remove === undefined) {
            return this._leftJoinRemove;
        }
        this._leftJoinRemove = remove;
        return this;
    };
    /**
     * Add an event listener. The `Editor` class will trigger an number of
     * events that some action can be taken on.
     * @param {string} name Event name
     * @param {Function} callback Event callback function that will be executed
     *   when the event occurs.
     * @returns {Editor} Self for chaining.
     */
    Editor.prototype.on = function (name, callback) {
        if (!this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push(callback);
        return this;
    };
    Editor.prototype.schema = function (schema) {
        if (schema === undefined) {
            return this._schema;
        }
        this._schema = schema;
        return this;
    };
    Editor.prototype.readTable = function (table) {
        if (table === undefined || table.length === 0) {
            return this._readTableNames;
        }
        if (typeof table === 'string') {
            this._readTableNames.push(table);
        }
        else {
            this._readTableNames.push.apply(this._readTableNames, table);
        }
        return this;
    };
    Editor.prototype.table = function (table) {
        if (table === undefined || table.length === 0) {
            return this._table;
        }
        if (typeof table === 'string') {
            this._table.push(table);
        }
        else {
            this._table.push.apply(this._table, table);
        }
        return this;
    };
    Editor.prototype.transaction = function (transaction) {
        if (transaction === undefined) {
            return this._transaction;
        }
        this._transaction = transaction;
        return this;
    };
    Editor.prototype.pkey = function (pkey) {
        if (pkey === undefined) {
            return this._pkey;
        }
        if (typeof pkey === 'string') {
            this._pkey = [pkey];
        }
        else {
            this._pkey = pkey;
        }
        return this;
    };
    /**
     * Convert a primary key array of field values to a combined value.
     * @param {object} row The row of data that the primary key value should
     *   be extracted from.
     * @param {boolean} [flat=false] Flag to indicate if the given array is flat
     *   (useful for `where` conditions) or nested for join tables.
     * @returns {string} The created primary key value.
     */
    Editor.prototype.pkeyToValue = function (row, flat) {
        if (flat === void 0) { flat = false; }
        var pkey = this.pkey();
        var id = [];
        var val;
        for (var i = 0, ien = pkey.length; i < ien; i++) {
            var column = pkey[i];
            if (flat) {
                val = row[column] !== undefined ?
                    row[column] :
                    null;
            }
            else {
                val = this._readProp(column, row);
            }
            if (val === null) {
                throw new Error('Primary key element is not available in the data set');
            }
            // Postgres gives a `Date` object for timestamps which causes issues as
            // a value, so convert it to be a string. Could also be done with setTypeParser
            // https://github.com/brianc/node-postgres/issues/1200
            if (val instanceof Date) {
                val = val.toISOString();
            }
            id.push(val);
        }
        return id.join(this._pkeySeparator());
    };
    /**
     * Convert a primary key combined value to an array of field values.
     * @param {string} value The id that should be split apart
     * @param {boolean} [flat=false] Flag to indicate if the returned array should be
     *   flat (useful for `where` conditions) or nested for join tables.
     * @param {string[]} [pkey=null] The primary key name - will use the instance value
     *   if not given
     * @returns {object} Array of field values that the id was made up of
     */
    Editor.prototype.pkeyToObject = function (value, flat, pkey) {
        if (flat === void 0) { flat = false; }
        if (pkey === void 0) { pkey = null; }
        var arr = {};
        value = value.replace(this.idPrefix(), '');
        var idParts = value.split(this._pkeySeparator());
        if (pkey === null) {
            pkey = this.pkey();
        }
        if (pkey.length !== idParts.length) {
            throw new Error('Primary key data does not match submitted data');
        }
        for (var i = 0, ien = idParts.length; i < ien; i++) {
            if (flat) {
                arr[pkey[i]] = idParts[i];
            }
            else {
                this._writeProp(arr, pkey[i], idParts[i]);
            }
        }
        return arr;
    };
    /**
     * Process a request from the Editor client-side to get / set data.
     * @param {IDtRequest} data Form data sent from the client-side -
     *   e.g. `req.body`
     * @param {IUpload} [files=null] File information, used for upload
     *   requests - e.g. `req.files`
     * @returns {Promise<Editor>} Promise that is fulfilled when Editor
     *   has completed its processing - result is the Editor instance.
     */
    Editor.prototype.process = function (data, files) {
        if (files === void 0) { files = null; }
        return __awaiter(this, void 0, void 0, function () {
            var processError_1, e_1, e_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.debug()) {
                            this._debugInfo.push('Editor Node.js libraries - version ' + Editor.version);
                        }
                        if (!this._transaction) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._db.transaction(function (trx) { return __awaiter(_this, void 0, void 0, function () {
                                var e_3;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 3, , 5]);
                                            this._knexTransaction = trx;
                                            return [4 /*yield*/, this._process(data, files)];
                                        case 1:
                                            _a.sent();
                                            this._knexTransaction = null;
                                            return [4 /*yield*/, trx.commit()];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 5];
                                        case 3:
                                            e_3 = _a.sent();
                                            processError_1 = e_3;
                                            return [4 /*yield*/, trx.rollback()];
                                        case 4:
                                            _a.sent();
                                            return [3 /*break*/, 5];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        if (this._tryCatch) {
                            this._out.error = processError_1.message;
                        }
                        else {
                            throw processError_1;
                        }
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 12];
                    case 5:
                        if (!this._tryCatch) return [3 /*break*/, 10];
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this._process(data, files)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_2 = _a.sent();
                        this._out.error = e_2.message;
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, this._process(data, files)];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12: return [2 /*return*/, this];
                }
            });
        });
    };
    Editor.prototype.tryCatch = function (tryCatch) {
        if (tryCatch === undefined) {
            return this._tryCatch;
        }
        this._tryCatch = tryCatch;
        return this;
    };
    /**
     * Perform validation on a data set.
     *
     * Note that validation is performed on data only when the action is
     * `create` or `edit`. Additionally, validation is performed on the _wire
     * data_ - i.e. that which is submitted from the client, without formatting.
     * Any formatting required by `setFormatter` is performed after the data
     * from the client has been validated.
     * @param {IDtError[]} errors Output array to which field error information will
     *   be written. Each element in the array represents a field in an error
     *   condition. These elements are themselves arrays with two properties
     *   set; `name` and `status`.
     * @param {IDtRequest} http The format data to check
     * @returns {Promise<boolean>} `true` if the data is valid, `false` if not.
     */
    Editor.prototype.validate = function (errors, http) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, fields, idPrefix, i, ien, values, j, jen, field, id, validation, j, jen, _i, _a, validator, ret;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this._doValidate === false) {
                            return [2 /*return*/, true];
                        }
                        if (http.action !== 'create' && http.action !== 'edit') {
                            return [2 /*return*/, true];
                        }
                        keys = Object.keys(http.data);
                        fields = this.fields();
                        idPrefix = this.idPrefix();
                        i = 0, ien = keys.length;
                        _b.label = 1;
                    case 1:
                        if (!(i < ien)) return [3 /*break*/, 10];
                        values = http.data[keys[i]];
                        j = 0, jen = fields.length;
                        _b.label = 2;
                    case 2:
                        if (!(j < jen)) return [3 /*break*/, 5];
                        field = fields[j];
                        id = keys[i].replace(idPrefix, '');
                        return [4 /*yield*/, field.validate(values, this, id, http.action)];
                    case 3:
                        validation = _b.sent();
                        if (validation !== true) {
                            errors.push({
                                id: id,
                                name: field.name(),
                                status: validation,
                            });
                        }
                        _b.label = 4;
                    case 4:
                        j++;
                        return [3 /*break*/, 2];
                    case 5:
                        j = 0, jen = this._join.length;
                        _b.label = 6;
                    case 6:
                        if (!(j < jen)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this._join[j].validate(errors, this, values, http.action)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        j++;
                        return [3 /*break*/, 6];
                    case 9:
                        i++;
                        return [3 /*break*/, 1];
                    case 10:
                        _i = 0, _a = this._validatorsAfterFields;
                        _b.label = 11;
                    case 11:
                        if (!(_i < _a.length)) return [3 /*break*/, 14];
                        validator = _a[_i];
                        return [4 /*yield*/, validator(this, http.action, http)];
                    case 12:
                        ret = _b.sent();
                        if (typeof ret === 'string') {
                            this._out.error = ret;
                            return [2 /*return*/, false];
                        }
                        _b.label = 13;
                    case 13:
                        _i++;
                        return [3 /*break*/, 11];
                    case 14: return [2 /*return*/, errors.length > 0 ?
                            false :
                            true];
                }
            });
        });
    };
    Editor.prototype.validator = function (afterFields, fn) {
        // Argument shifting
        if (afterFields === undefined) {
            // No args
            afterFields = false;
        }
        else if (typeof afterFields === 'function') {
            // Single arg, function
            fn = afterFields;
            afterFields = false;
        }
        // Else two args are inherently handled
        // Getter
        if (fn === undefined) {
            return afterFields
                ? this._validatorsAfterFields
                : this._validators;
        }
        // Setter
        if (afterFields) {
            this._validatorsAfterFields.push(fn);
        }
        else {
            this._validators.push(fn);
        }
        return this;
    };
    Editor.prototype.where = function () {
        var cond = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cond[_i] = arguments[_i];
        }
        if (cond.length === 0) {
            return this._where;
        }
        this._where.push(cond);
        return this;
    };
    /**
     * Clear out the `where` conditions already applied to this instance
     * @returns {Editor} Self for chaining.
     */
    Editor.prototype.whereClear = function () {
        this._where = [];
        return this;
    };
    /**
    * Getter/Setter for this._write which is used to decide which actions to allow
    * @param writeVal Value for this._write
    */
    Editor.prototype.write = function (writeVal) {
        if (writeVal == undefined) {
            return this._write;
        }
        else if (typeof (writeVal) === "boolean") {
            this._write = writeVal;
            return this;
        }
        else {
            return this;
        }
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Private methods
     */
    Editor.prototype._fileClean = function () {
        return __awaiter(this, void 0, void 0, function () {
            var that, run, i, ien;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        that = this;
                        run = function (fields) {
                            return __awaiter(this, void 0, void 0, function () {
                                var i, ien, upload;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            i = 0, ien = fields.length;
                                            _a.label = 1;
                                        case 1:
                                            if (!(i < ien)) return [3 /*break*/, 4];
                                            upload = fields[i].upload();
                                            if (!upload) return [3 /*break*/, 3];
                                            return [4 /*yield*/, upload.dbCleanExec(that, fields[i])];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3:
                                            i++;
                                            return [3 /*break*/, 1];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        return [4 /*yield*/, run(this._fields)];
                    case 1:
                        _a.sent();
                        i = 0, ien = this._join.length;
                        _a.label = 2;
                    case 2:
                        if (!(i < ien)) return [3 /*break*/, 5];
                        return [4 /*yield*/, run(this._join[i].fields())];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Editor.prototype._fileData = function (limitTable, ids, data) {
        if (limitTable === void 0) { limitTable = null; }
        if (ids === void 0) { ids = null; }
        if (data === void 0) { data = null; }
        return __awaiter(this, void 0, void 0, function () {
            var files, i, ien, joinData, j, jen, innerData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        files = {};
                        // The fields in this instance
                        return [4 /*yield*/, this._fileDataFields(files, this._fields, limitTable, ids, data)];
                    case 1:
                        // The fields in this instance
                        _a.sent();
                        i = 0, ien = this._join.length;
                        _a.label = 2;
                    case 2:
                        if (!(i < ien)) return [3 /*break*/, 5];
                        joinData = null;
                        // If we have data from the get, it is nested from the join, so we need to
                        // un-nest it (i.e. get the array of joined data for each row)
                        if (data) {
                            joinData = [];
                            for (j = 0, jen = data.length; j < jen; j++) {
                                innerData = data[j][this._join[i].name()];
                                if (innerData) {
                                    joinData.push.apply(joinData, innerData);
                                }
                            }
                        }
                        return [4 /*yield*/, this._fileDataFields(files, this._join[i].fields(), limitTable, ids, joinData)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, files];
                }
            });
        });
    };
    Editor.prototype._fileDataFields = function (files, fields, limitTable, ids, data) {
        if (ids === void 0) { ids = null; }
        if (data === void 0) { data = null; }
        return __awaiter(this, void 0, void 0, function () {
            var i, ien, upload, table, j, jen, val, fileData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0, ien = fields.length;
                        _a.label = 1;
                    case 1:
                        if (!(i < ien)) return [3 /*break*/, 4];
                        upload = fields[i].upload();
                        if (!upload) return [3 /*break*/, 3];
                        table = upload.table();
                        if (!table) {
                            return [3 /*break*/, 3];
                        }
                        if (limitTable !== null && table !== limitTable) {
                            return [3 /*break*/, 3];
                        }
                        if (files[table]) {
                            return [3 /*break*/, 3];
                        }
                        // Make a collection of the ids used in this data set to get a limited data set
                        // in return (security and performance)
                        if (ids === null) {
                            ids = [];
                        }
                        if (data !== null) {
                            for (j = 0, jen = data.length; j < jen; j++) {
                                val = fields[i].val('set', data[j]);
                                if (val) {
                                    ids.push(val);
                                }
                            }
                            if (ids.length === 0) {
                                // If no data to fetch, then don't bother
                                return [2 /*return*/];
                            }
                            else if (ids.length > 1000) {
                                // Don't use WHERE IN for really large arrays
                                ids = null;
                            }
                        }
                        return [4 /*yield*/, upload.data(this.db(), ids)];
                    case 2:
                        fileData = _a.sent();
                        if (fileData) {
                            files[table] = fileData;
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Editor.prototype._findField = function (name, type) {
        var fields = this._fields;
        for (var i = 0, ien = fields.length; i < ien; i++) {
            var field = fields[i];
            if (field === undefined) {
                continue;
            }
            if (type === 'name' && field.name() === name) {
                return field;
            }
            else if (type === 'db' && field.dbField() === name) {
                return field;
            }
        }
        return null;
    };
    Editor.prototype._get = function (id, http) {
        if (http === void 0) { http = null; }
        return __awaiter(this, void 0, void 0, function () {
            var response, cancel, fields, pkeys, query, options, i, ien, i, ien, dbField, ssp, result, out, i, ien, inner, j, jen, i, ien, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._trigger('preGet', id)];
                    case 1:
                        cancel = _b.sent();
                        if (cancel === false) {
                            return [2 /*return*/, {}];
                        }
                        if (!this._customGet) return [3 /*break*/, 2];
                        response = this._customGet(id, http);
                        return [3 /*break*/, 8];
                    case 2:
                        fields = this.fields();
                        pkeys = this.pkey();
                        query = this.db().table(this._readTable()[0]);
                        options = {};
                        for (i = 0, ien = pkeys.length; i < ien; i++) {
                            query.select(pkeys[i] + ' as ' + pkeys[i]);
                        }
                        for (i = 0, ien = fields.length; i < ien; i++) {
                            if (pkeys.includes(fields[i].dbField())) {
                                continue;
                            }
                            if (fields[i].apply('get') && fields[i].getValue() === undefined) {
                                dbField = fields[i].dbField();
                                if (dbField.indexOf('(') === -1) {
                                    query.select(dbField + ' as ' + dbField);
                                }
                                else {
                                    query.select(this.db().raw(dbField + ' as "' + dbField + '"'));
                                }
                            }
                        }
                        this._getWhere(query);
                        (0, helpers_1.leftJoin)(query, this._leftJoin);
                        if (id !== null) {
                            // Allow multiple specific rows to be requested at a time
                            if (Array.isArray(id)) {
                                query.where(function (q) {
                                    for (var _i = 0, id_1 = id; _i < id_1.length; _i++) {
                                        var ident = id_1[_i];
                                        q.orWhere(_this.pkeyToObject(ident, true));
                                    }
                                });
                            }
                            else {
                                query.where(this.pkeyToObject(id, true));
                            }
                        }
                        // If there is a searchBuilder condition present in the request data
                        if (http !== null && http.searchBuilder !== undefined && http.searchBuilder !== null) {
                            // Run the above function for the first level of the searchBuilder data
                            if (http.searchBuilder.criteria !== undefined) {
                                query = _constructSearchBuilderQuery.apply(query, [http.searchBuilder]);
                            }
                        }
                        return [4 /*yield*/, this._ssp(query, http)];
                    case 3:
                        ssp = _b.sent();
                        return [4 /*yield*/, query];
                    case 4:
                        result = _b.sent();
                        if (!result) {
                            throw new Error('Error executing SQL for data get. Enable SQL debug using ' +
                                '`debug: true` in your Knex db configuration');
                        }
                        out = [];
                        for (i = 0, ien = result.length; i < ien; i++) {
                            inner = {
                                DT_RowId: this.idPrefix() + this.pkeyToValue(result[i], true),
                            };
                            for (j = 0, jen = fields.length; j < jen; j++) {
                                if (fields[j].apply('get') && fields[j].http()) {
                                    fields[j].write(inner, result[i]);
                                }
                            }
                            out.push(inner);
                        }
                        // Build a DtResponse object
                        response = {
                            data: out,
                            draw: ssp.draw,
                            files: {},
                            options: {},
                            recordsFiltered: ssp.recordsFiltered,
                            recordsTotal: ssp.recordsTotal
                        };
                        i = 0, ien = this._join.length;
                        _b.label = 5;
                    case 5:
                        if (!(i < ien)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._join[i].data(this, response)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8:
                        _a = response;
                        return [4 /*yield*/, this._fileData(null, null, response.data)];
                    case 9:
                        _a.files = _b.sent();
                        return [4 /*yield*/, this._trigger('postGet', id, response.data)];
                    case 10:
                        _b.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Editor.prototype._getWhere = function (query) {
        var where = this.where();
        for (var i = 0, ien = where.length; i < ien; i++) {
            query.where.apply(query, where[i]);
        }
    };
    Editor.prototype._insert = function (values) {
        return __awaiter(this, void 0, void 0, function () {
            var all, id, i, ien;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        all = [];
                        this._fields.forEach(function (f) {
                            if (f.val('set', values)) {
                                _this._writeProp(all, f.name(), f.val('set', values));
                            }
                        });
                        // Only allow a composite insert if the values for the key are
                        // submitted. This is required because there is no reliable way in MySQL
                        // to return the newly inserted row, so we can't know any newly
                        // generated values.
                        this._pkeyValidateInsert(all);
                        return [4 /*yield*/, this._trigger('validatedCreate', values)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._insertOrUpdate(null, values)];
                    case 2:
                        id = _a.sent();
                        if (id === null) {
                            return [2 /*return*/, null];
                        }
                        // Was the primary key altered as part of the edit, if so use the
                        // submitted values
                        id = this._pkey.length > 1 ?
                            this.pkeyToValue(all) :
                            this._pkeySubmitMerge(id, all);
                        i = 0, ien = this._join.length;
                        _a.label = 3;
                    case 3:
                        if (!(i < ien)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._join[i].create(this, id, values)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [4 /*yield*/, this._trigger('writeCreate', id, values)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, id];
                }
            });
        });
    };
    Editor.prototype._insertOrUpdate = function (id, values) {
        return __awaiter(this, void 0, void 0, function () {
            var tables, i, ien, res, i, ien, join, joinTable, tablePart, parentLink, childLink, whereVal, field, whereName;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tables = this.table();
                        i = 0, ien = tables.length;
                        _b.label = 1;
                    case 1:
                        if (!(i < ien)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._insertOrUpdateTable(tables[i], values, id !== null ?
                                this.pkeyToObject(id, true) :
                                null)];
                    case 2:
                        res = _b.sent();
                        // If you don't have an id yet, then the first insert will return
                        // the id we want
                        if (res !== null && id === null) {
                            id = res;
                        }
                        _b.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        i = 0, ien = this._leftJoin.length;
                        _b.label = 5;
                    case 5:
                        if (!(i < ien)) return [3 /*break*/, 8];
                        join = this._leftJoin[i];
                        if (join.fn) {
                            // Don't do updates / inserts when we can't understand the join
                            return [3 /*break*/, 7];
                        }
                        joinTable = this._alias(join.table, 'alias');
                        tablePart = this._part(join.field1);
                        parentLink = void 0;
                        childLink = void 0;
                        whereVal = void 0;
                        if (this._part(join.field1, 'db')) {
                            tablePart = this._part(join.field1, 'db') + '.' + tablePart;
                        }
                        if (tablePart === joinTable) {
                            parentLink = join.field2;
                            childLink = join.field1;
                        }
                        else {
                            parentLink = join.field1;
                            childLink = join.field2;
                        }
                        if (parentLink === this._pkey[0] && this._pkey.length === 1) {
                            whereVal = id;
                        }
                        else {
                            field = this._findField(parentLink, 'db');
                            if (!field || !field.apply('edit', values)) {
                                // If not, then check if the child id was submitted
                                field = this._findField(childLink, 'db');
                                if (!field || !field.apply('edit', values)) {
                                    // No data available, so we can't do anything
                                    return [3 /*break*/, 7];
                                }
                            }
                            whereVal = field.val('set', values);
                        }
                        whereName = this._part(childLink, 'column');
                        return [4 /*yield*/, this._insertOrUpdateTable(join.table, values, (_a = {}, _a[whereName] = whereVal, _a))];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, id];
                }
            });
        });
    };
    Editor.prototype._insertOrUpdateTable = function (table, values, where) {
        if (where === void 0) { where = null; }
        return __awaiter(this, void 0, void 0, function () {
            var set, res, action, tableAlias, fields, i, ien, field, tablePart, fieldPart, pkey, check;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        set = {};
                        action = (where === null) ? 'create' : 'edit';
                        tableAlias = this._alias(table, 'alias');
                        fields = this.fields();
                        for (i = 0, ien = fields.length; i < ien; i++) {
                            field = fields[i];
                            tablePart = this._part(field.dbField());
                            if (this._part(field.dbField(), 'db')) {
                                tablePart = this._part(field.dbField(), 'db') + '.' + tablePart;
                            }
                            // Does this field apply to the table (only check when a join is
                            // being used)
                            if (this._leftJoin.length && tablePart !== tableAlias) {
                                continue;
                            }
                            // Check if this field should be set, based on options and
                            // submitted data
                            if (!field.apply(action, values)) {
                                continue;
                            }
                            fieldPart = this._part(field.dbField(), 'column');
                            set[fieldPart] = field.val('set', values);
                        }
                        if (Object.keys(set).length === 0) {
                            return [2 /*return*/, null];
                        }
                        if (!(action === 'create' && this.table().indexOf(table) !== -1)) return [3 /*break*/, 2];
                        pkey = this._part(this._pkey[0], 'column');
                        return [4 /*yield*/, this
                                .db()
                                .insert(set)
                                .table(table)
                                .returning(pkey)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, typeof res[0] === 'object' ?
                                res[0][pkey].toString() :
                                res[0].toString()];
                    case 2:
                        if (!(action === 'create')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this
                                .db()
                                .insert(set)
                                .table(table)];
                    case 3:
                        // Create on a linked table
                        res = _a.sent();
                        return [3 /*break*/, 12];
                    case 4:
                        if (!(this.table().indexOf(table) === -1)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this
                                .db()
                                .table(table)
                                .select('*')
                                .where(where)];
                    case 5:
                        check = _a.sent();
                        if (!(check && check.length)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this
                                .db()
                                .table(table)
                                .update(set)
                                .where(where)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, this
                            .db()
                            .table(table)
                            .insert(__assign(__assign({}, set), where))];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [3 /*break*/, 12];
                    case 10: 
                    // Update on the host table
                    return [4 /*yield*/, this
                            .db()
                            .table(table)
                            .update(set)
                            .where(where)];
                    case 11:
                        // Update on the host table
                        _a.sent();
                        _a.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    Editor.prototype._alias = function (name, type) {
        if (type === void 0) { type = 'alias'; }
        if (name.indexOf(' as ') !== -1) {
            var a = name.split(/ as /i);
            return type === 'alias' ?
                a[1] :
                a[0];
        }
        if (name.indexOf(' ') !== -1) {
            var a = name.split(/ /i);
            return type === 'alias' ?
                a[1] :
                a[0];
        }
        return name;
    };
    /**
     * Get option lists for select, radio, autocomplete, etc.
     *
     * @param refresh false for initial load, true if after insert, update
     */
    Editor.prototype._options = function (refresh) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, i, ien, field, options, opts, spOpts, sbOpts, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = this.fields();
                        i = 0, ien = fields.length;
                        _a.label = 1;
                    case 1:
                        if (!(i < ien)) return [3 /*break*/, 7];
                        field = fields[i];
                        options = field.options();
                        if (!options) return [3 /*break*/, 3];
                        return [4 /*yield*/, options.exec(this._db, refresh)];
                    case 2:
                        opts = _a.sent();
                        if (opts !== false) {
                            this._out.options[field.name()] = opts;
                        }
                        _a.label = 3;
                    case 3: return [4 /*yield*/, fields[i].searchPaneOptionsExec(field, this, this._processData, fields, this._leftJoin, this.db())];
                    case 4:
                        spOpts = _a.sent();
                        if (spOpts) {
                            if (!this._out.searchPanes) {
                                this._out.searchPanes = { options: {} };
                            }
                            this._out.searchPanes.options[field.name()] = spOpts;
                        }
                        return [4 /*yield*/, fields[i].searchBuilderOptionsExec(field, this, this._processData, fields, this._leftJoin, this.db())];
                    case 5:
                        sbOpts = _a.sent();
                        if (sbOpts) {
                            if (!this._out.searchBuilder) {
                                this._out.searchBuilder = { options: {} };
                            }
                            this._out.searchBuilder.options[field.name()] = sbOpts;
                        }
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7:
                        i = 0;
                        _a.label = 8;
                    case 8:
                        if (!(i < this._join.length)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this._join[i].options(this._out.options, this._db, refresh)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        i++;
                        return [3 /*break*/, 8];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Perform a search action on a specific field for label/value pairs.
     *
     * @param array $http Submitted HTTP request for search
     */
    Editor.prototype._optionsSearch = function (http) {
        return __awaiter(this, void 0, void 0, function () {
            var values, field, options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        values = null;
                        field = this._findField(http.field, 'name');
                        if (!field) {
                            return [2 /*return*/];
                        }
                        options = field.options();
                        if (!options) {
                            return [2 /*return*/];
                        }
                        if (!http.search) return [3 /*break*/, 2];
                        return [4 /*yield*/, options.search(this.db(), http.search)];
                    case 1:
                        values = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!http.values) return [3 /*break*/, 4];
                        return [4 /*yield*/, options.find(this.db(), http.values)];
                    case 3:
                        values = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (values) {
                            this._out.data = values;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Editor.prototype._part = function (name, type) {
        if (type === void 0) { type = 'table'; }
        var db;
        var table;
        var column;
        if (name.indexOf('.') !== -1) {
            var a = name.split('.');
            if (a.length === 3) {
                db = a[0];
                table = a[1];
                column = a[2];
            }
            else if (a.length === 2) {
                table = a[0];
                column = a[1];
            }
        }
        else {
            column = name;
        }
        if (type === 'db') {
            return db;
        }
        else if (type === 'table') {
            return table;
        }
        return column;
    };
    Editor.prototype._prepJoin = function () {
        if (this._leftJoin.length === 0) {
            return;
        }
        // Check if the primary key has a table identifier - if not - add one
        for (var i = 0, ien = this._pkey.length; i < ien; i++) {
            var val = this._pkey[i];
            if (val.indexOf('.') === -1) {
                this._pkey[i] = this._alias(this.table()[0], 'alias') + '.' + val;
            }
        }
        // Check that all fields have a table selector, otherwise, we'd need to
        // know the structure of the tables, to know which fields belong in
        // which. This extra requirement on the fields removes that
        for (var i = 0, ien = this._fields.length; i < ien; i++) {
            var field = this._fields[i];
            var name_1 = field.dbField();
            if (name_1.indexOf('.') === -1) {
                throw new Error('Table part of the field "' + name_1 + '" was not found. ' +
                    'In Editor instances that use a join, all fields must have the ' +
                    'database table set explicitly.');
            }
        }
    };
    Editor.prototype._pkeySeparator = function () {
        var str = this.pkey().join(',');
        return crc.crc32(str).toString(16);
    };
    Editor.prototype._pkeySubmitMerge = function (pkeyVal, row) {
        var pkey = this._pkey;
        var arr = this.pkeyToObject(pkeyVal, true);
        for (var i = 0, ien = pkey.length; i < ien; i++) {
            var column = pkey[i];
            var field = this._findField(column, 'db');
            if (field && field.apply('edit', row)) {
                arr[column] = field.val('set', row);
            }
        }
        return this.pkeyToValue(arr, true);
    };
    Editor.prototype._pkeyValidateInsert = function (row) {
        var pkey = this.pkey();
        if (pkey.length === 1) {
            return true;
        }
        for (var i = 0, ien = pkey.length; i < ien; i++) {
            var column = pkey[i];
            var field = this._findField(column, 'db');
            if (!field || !field.apply('create', row)) {
                throw new Error('When inserting into a compound key table, ' +
                    'all fields that are part of the compound key must be ' +
                    'submitted with a specific value.');
            }
        }
        return true;
    };
    Editor.prototype._process = function (data, upload) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, validator, ret, action, outData, _b, _c, _d, key, val, keys, i, ien, cancel, idSrc, values, id, valid, pkeys_2, eventName, _e, keys_1, key, pkey, _f, submitedData_1, returnData, _loop_2, this_2, _g, pkeys_1, key;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        this._out = {
                            cancelled: [],
                            data: [],
                            fieldErrors: [],
                            options: {}
                        };
                        this._processData = data;
                        this._uploadData = upload;
                        this._formData = data.data ? data.data : null;
                        this._prepJoin();
                        _i = 0, _a = this._validators;
                        _h.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        validator = _a[_i];
                        return [4 /*yield*/, validator(this, data.action, data)];
                    case 2:
                        ret = _h.sent();
                        if (typeof ret === 'string') {
                            this._out.error = ret;
                            return [3 /*break*/, 4];
                        }
                        _h.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (data.action && data.action !== 'upload' && !data.data && !data.search && !data.values) {
                            this._out.error = 'No data detected. Have you used `{extended: true}` for `bodyParser`?';
                        }
                        action = Editor.action(data);
                        if (!!this._out.error) return [3 /*break*/, 41];
                        if (!(action === Action.Read)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this._get(null, data)];
                    case 5:
                        outData = _h.sent();
                        for (_b = 0, _c = Object.entries(outData); _b < _c.length; _b++) {
                            _d = _c[_b], key = _d[0], val = _d[1];
                            this._out[key] = val;
                        }
                        return [4 /*yield*/, this._options(false)];
                    case 6:
                        _h.sent();
                        return [3 /*break*/, 41];
                    case 7:
                        if (!(action === Action.Search)) return [3 /*break*/, 9];
                        /* Options search */
                        return [4 /*yield*/, this._optionsSearch(data)];
                    case 8:
                        /* Options search */
                        _h.sent();
                        return [3 /*break*/, 41];
                    case 9:
                        if (!(action === Action.Upload && this._write)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this._upload(data)];
                    case 10:
                        _h.sent();
                        return [3 /*break*/, 41];
                    case 11:
                        if (!(action === Action.Delete && this._write)) return [3 /*break*/, 15];
                        return [4 /*yield*/, this._remove(data)];
                    case 12:
                        _h.sent();
                        return [4 /*yield*/, this._options(true)];
                    case 13:
                        _h.sent();
                        return [4 /*yield*/, this._fileClean()];
                    case 14:
                        _h.sent();
                        return [3 /*break*/, 41];
                    case 15:
                        if (!((action === Action.Create || action === Action.Edit) && this._write)) return [3 /*break*/, 41];
                        keys = Object.keys(data.data);
                        i = 0, ien = keys.length;
                        _h.label = 16;
                    case 16:
                        if (!(i < ien)) return [3 /*break*/, 22];
                        cancel = null;
                        idSrc = keys[i];
                        values = data.data[keys[i]];
                        if (!(action === Action.Create)) return [3 /*break*/, 18];
                        return [4 /*yield*/, this._trigger('preCreate', values)];
                    case 17:
                        cancel = _h.sent();
                        return [3 /*break*/, 20];
                    case 18:
                        id = idSrc.replace(this.idPrefix(), '');
                        return [4 /*yield*/, this._trigger('preEdit', id, values)];
                    case 19:
                        cancel = _h.sent();
                        _h.label = 20;
                    case 20:
                        // One of the event handlers returned false - don't continue
                        if (cancel === false) {
                            // Remove the data from the data set so it won't be processed
                            delete data.data[idSrc];
                            // Tell the client-side we aren't updating this row
                            this._out.cancelled.push(idSrc);
                        }
                        _h.label = 21;
                    case 21:
                        i++;
                        return [3 /*break*/, 16];
                    case 22: return [4 /*yield*/, this.validate(this._out.fieldErrors, data)];
                    case 23:
                        valid = _h.sent();
                        pkeys_2 = [];
                        eventName = action === Action.Create ?
                            'Create' :
                            'Edit';
                        if (!valid) return [3 /*break*/, 39];
                        keys = Object.keys(data.data);
                        _e = 0, keys_1 = keys;
                        _h.label = 24;
                    case 24:
                        if (!(_e < keys_1.length)) return [3 /*break*/, 30];
                        key = keys_1[_e];
                        if (!(action === Action.Create)) return [3 /*break*/, 26];
                        return [4 /*yield*/, this._insert(data.data[key])];
                    case 25:
                        _f = _h.sent();
                        return [3 /*break*/, 28];
                    case 26: return [4 /*yield*/, this._update(key, data.data[key])];
                    case 27:
                        _f = _h.sent();
                        _h.label = 28;
                    case 28:
                        pkey = _f;
                        pkeys_2.push({
                            dataKey: this.idPrefix() + pkey,
                            pkey: pkey,
                            submitKey: key, // could be array index (create)
                        });
                        _h.label = 29;
                    case 29:
                        _e++;
                        return [3 /*break*/, 24];
                    case 30:
                        submitedData_1 = {};
                        Object.keys(data.data).forEach(function (key) {
                            var k = pkeys_2.find(function (p) { return p.submitKey === key; });
                            submitedData_1[k.pkey] = data.data[key];
                        });
                        // All writes done - trigger `All`
                        return [4 /*yield*/, this._trigger("write".concat(eventName, "All"), pkeys_2.map(function (k) { return k.pkey; }), submitedData_1)];
                    case 31:
                        // All writes done - trigger `All`
                        _h.sent();
                        return [4 /*yield*/, this._get(pkeys_2.map(function (k) { return k.pkey; }))];
                    case 32:
                        returnData = _h.sent();
                        this._out.data = returnData.data;
                        _loop_2 = function (key) {
                            return __generator(this, function (_j) {
                                switch (_j.label) {
                                    case 0: return [4 /*yield*/, this_2._trigger("post".concat(eventName), key.pkey, data.data[key.submitKey], returnData.data.find(function (row) { return row['DT_RowId'] === key.dataKey; }))];
                                    case 1:
                                        _j.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        _g = 0, pkeys_1 = pkeys_2;
                        _h.label = 33;
                    case 33:
                        if (!(_g < pkeys_1.length)) return [3 /*break*/, 36];
                        key = pkeys_1[_g];
                        return [5 /*yield**/, _loop_2(key)];
                    case 34:
                        _h.sent();
                        _h.label = 35;
                    case 35:
                        _g++;
                        return [3 /*break*/, 33];
                    case 36: return [4 /*yield*/, this._trigger("post".concat(eventName, "All"), pkeys_2.map(function (k) { return k.pkey; }), submitedData_1, returnData.data)];
                    case 37:
                        _h.sent();
                        // File tidy up
                        return [4 /*yield*/, this._fileClean()];
                    case 38:
                        // File tidy up
                        _h.sent();
                        _h.label = 39;
                    case 39: return [4 /*yield*/, this._options(true)];
                    case 40:
                        _h.sent();
                        _h.label = 41;
                    case 41: return [4 /*yield*/, this._trigger("processed", action, data, this._out)];
                    case 42:
                        _h.sent();
                        if (this._debug) {
                            this._out.debug = this._debugInfo.slice();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Editor.prototype._readTable = function () {
        return this._readTableNames.length ?
            this._readTableNames :
            this._table;
    };
    Editor.prototype._remove = function (http) {
        return __awaiter(this, void 0, void 0, function () {
            var ids, keys, i, ien, id, res, i, ien, i, ien, join, table, parentLink, childLink, tables, i, ien, i, ien;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ids = [];
                        keys = Object.keys(http.data);
                        i = 0, ien = keys.length;
                        _a.label = 1;
                    case 1:
                        if (!(i < ien)) return [3 /*break*/, 4];
                        id = keys[i].replace(this.idPrefix(), '');
                        return [4 /*yield*/, this._trigger('preRemove', id, http.data[keys[i]])];
                    case 2:
                        res = _a.sent();
                        // Allow the event to be cancelled and inform the client-side
                        if (res === false) {
                            this._out.cancelled.push(id);
                        }
                        else {
                            ids.push(id);
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (ids.length === 0) {
                            return [2 /*return*/];
                        }
                        i = 0, ien = this._join.length;
                        _a.label = 5;
                    case 5:
                        if (!(i < ien)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._join[i].remove(this, ids)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8:
                        if (!this._leftJoinRemove) return [3 /*break*/, 12];
                        i = 0, ien = this._leftJoin.length;
                        _a.label = 9;
                    case 9:
                        if (!(i < ien)) return [3 /*break*/, 12];
                        join = this._leftJoin[i];
                        table = this._alias(join.table, 'orig');
                        parentLink = void 0;
                        childLink = void 0;
                        // Which side of the join refers to the parent table?
                        if (join.field1.indexOf(join.table) === 0) {
                            parentLink = join.field2;
                            childLink = join.field1;
                        }
                        else {
                            parentLink = join.field1;
                            childLink = join.field2;
                        }
                        if (!(parentLink === this._pkey[0] && this._pkey.length === 1)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this._removeTable(join.table, ids, [childLink])];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        i++;
                        return [3 /*break*/, 9];
                    case 12:
                        tables = this.table();
                        i = 0, ien = tables.length;
                        _a.label = 13;
                    case 13:
                        if (!(i < ien)) return [3 /*break*/, 16];
                        return [4 /*yield*/, this._removeTable(tables[i], ids)];
                    case 14:
                        _a.sent();
                        _a.label = 15;
                    case 15:
                        i++;
                        return [3 /*break*/, 13];
                    case 16:
                        i = 0, ien = ids.length;
                        _a.label = 17;
                    case 17:
                        if (!(i < ien)) return [3 /*break*/, 20];
                        return [4 /*yield*/, this._trigger('postRemove', ids[i], http.data[this.idPrefix() + ids[i]])];
                    case 18:
                        _a.sent();
                        _a.label = 19;
                    case 19:
                        i++;
                        return [3 /*break*/, 17];
                    case 20: return [4 /*yield*/, this._trigger('postRemoveAll', ids, http.data)];
                    case 21:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Editor.prototype._removeTable = function (table, ids, pkey) {
        if (pkey === void 0) { pkey = null; }
        return __awaiter(this, void 0, void 0, function () {
            var count, fields, tableAlias, tableOrig, i, ien, i, ien, dbField, q, _loop_3, this_3, i, ien;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (pkey === null) {
                            pkey = this.pkey();
                        }
                        count = 0;
                        fields = this.fields();
                        tableAlias = this._alias(table, 'alias');
                        tableOrig = this._alias(table, 'orig');
                        // This is a bit 'iffy', but required since knex delete does not support delete with an alias
                        // and our pkey might have an alias. If that's the case, need to replace. The `pkeySeparator`
                        // method uses `this.pkey()` which is how we get away with this.
                        for (i = 0, ien = pkey.length; i < ien; i++) {
                            if (pkey[i].indexOf(tableAlias + '.') === 0) {
                                pkey[i] = pkey[i].replace(tableAlias + '.', tableOrig + '.');
                            }
                        }
                        for (i = 0, ien = fields.length; i < ien; i++) {
                            dbField = fields[i].dbField();
                            if (dbField.indexOf('.') === -1 ||
                                (this._part(dbField, 'table') === tableAlias && fields[i].set() !== field_1.SetType.None)) {
                                count++;
                            }
                        }
                        if (!(count > 0)) return [3 /*break*/, 2];
                        q = this.db().from(tableOrig);
                        _loop_3 = function (i, ien) {
                            var cond = this_3.pkeyToObject(ids[i], true, pkey);
                            q.orWhere(function () {
                                this.where(cond);
                            });
                        };
                        this_3 = this;
                        for (i = 0, ien = ids.length; i < ien; i++) {
                            _loop_3(i, ien);
                        }
                        return [4 /*yield*/, q.del()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Editor.prototype._ssp = function (query, http) {
        return __awaiter(this, void 0, void 0, function () {
            var setCount, res, recordsFiltered, fullCount, recordsTotal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!http || !http.draw) {
                            return [2 /*return*/, {}];
                        }
                        // Add the server-side processing conditions to the get query
                        this._sspLimit(query, http);
                        this._sspSort(query, http);
                        this._sspFilter(query, http);
                        setCount = this
                            .db()
                            .from(this._readTable()[0])
                            .count(this._pkey[0] + ' as cnt');
                        this._getWhere(setCount);
                        this._sspFilter(setCount, http);
                        (0, helpers_1.leftJoin)(setCount, this._leftJoin);
                        return [4 /*yield*/, setCount];
                    case 1:
                        res = _a.sent();
                        recordsFiltered = res[0].cnt;
                        fullCount = this
                            .db()
                            .from(this._readTable()[0])
                            .count(this._pkey[0] + ' as cnt');
                        this._getWhere(fullCount);
                        if (this._where.length) { // only needed if there is a where condition
                            (0, helpers_1.leftJoin)(fullCount, this._leftJoin);
                        }
                        return [4 /*yield*/, fullCount];
                    case 2:
                        res = _a.sent();
                        recordsTotal = res[0].cnt;
                        return [2 /*return*/, {
                                draw: http.draw * 1,
                                recordsFiltered: recordsFiltered,
                                recordsTotal: recordsTotal
                            }];
                }
            });
        });
    };
    Editor.prototype._sspField = function (http, index) {
        var name = http.columns[index].data;
        var field = this._findField(name, 'name');
        if (!field) {
            // Is it the primary key?
            if (name === 'DT_RowId') {
                return this._pkey[0];
            }
            throw new Error('Unknown field: ' + name + ' (index ' + index + ')');
        }
        return field.dbField();
    };
    Editor.prototype._sspFilter = function (query, http) {
        var _this = this;
        var fields = this.fields();
        // Global filter
        if (http.search.value) {
            query.where(function (q) {
                for (var i = 0, ien = http.columns.length; i < ien; i++) {
                    if (http.columns[i].searchable.toString() === 'true') {
                        var field = _this._sspField(http, i);
                        if (field) {
                            var client = _this._db.client.config.client;
                            // Nasty hack for Postgres
                            if (client === 'pg' || client === 'postgres') {
                                q.orWhereRaw('??::text ILIKE ?', [field, '%' + http.search.value + '%']);
                            }
                            else {
                                q.orWhere(field, 'LIKE', '%' + http.search.value + '%');
                            }
                        }
                    }
                }
            });
        }
        if (http.searchPanes !== null && http.searchPanes !== undefined) {
            var _loop_4 = function (field) {
                if (http.searchPanes[field.name()] !== undefined) {
                    query.where(function () {
                        for (var i = 0; i < http.searchPanes[field.name()].length; i++) {
                            if (http.searchPanes_null !== undefined && http.searchPanes_null[field.name()] !== undefined && http.searchPanes_null[field.name()][i] !== 'false') {
                                this.orWhereNull(field.name());
                            }
                            else {
                                this.orWhere(field.name(), http.searchPanes[field.name()][i]);
                            }
                        }
                    });
                }
            };
            for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                var field = fields_1[_i];
                _loop_4(field);
            }
        }
        // If there is a searchBuilder condition present in the request data
        if (http !== null && http.searchBuilder !== undefined && http.searchBuilder !== null) {
            // Run the above function for the first level of the searchBuilder data
            if (http.searchBuilder.criteria !== undefined) {
                query = _constructSearchBuilderQuery.apply(query, [http.searchBuilder]);
            }
        }
        // Column filter
        for (var i = 0, ien = http.columns.length; i < ien; i++) {
            var column = http.columns[i];
            var search = column.search.value;
            if (search !== '' && column.searchable.toString() === 'true') {
                // Nasty hack for Postgres
                if (this._db.client.config.client === 'pg') {
                    query.whereRaw('??::text ILIKE ?', [this._sspField(http, i), '%' + search + '%']);
                }
                else {
                    query.where(this._sspField(http, i), 'LIKE', '%' + search + '%');
                }
            }
        }
    };
    Editor.prototype._sspLimit = function (query, http) {
        if (http.length !== -1) { // -1 is 'show all' in DataTables
            query
                .limit(http.length * 1)
                .offset(http.start * 1);
        }
    };
    Editor.prototype._sspSort = function (query, http) {
        if (http.order) {
            for (var i = 0, ien = http.order.length; i < ien; i++) {
                var order = http.order[i];
                query.orderBy(this._sspField(http, order.column), order.dir === 'asc' ? 'asc' : 'desc');
            }
        }
        if (!http.order || http.order.length === 0) {
            query.orderBy(this._pkey[0], 'asc');
        }
    };
    Editor.prototype._trigger = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var out, events, i, ien, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        out = null;
                        events = this._events[name];
                        if (!this._events[name]) {
                            return [2 /*return*/];
                        }
                        args.unshift(this);
                        i = 0, ien = events.length;
                        _a.label = 1;
                    case 1:
                        if (!(i < ien)) return [3 /*break*/, 4];
                        return [4 /*yield*/, events[i].apply(this, args)];
                    case 2:
                        res = _a.sent();
                        if (res !== null) {
                            out = res;
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, out];
                }
            });
        });
    };
    Editor.prototype._update = function (id, values) {
        return __awaiter(this, void 0, void 0, function () {
            var i, ien, getId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = id.replace(this.idPrefix(), '');
                        return [4 /*yield*/, this._trigger('validatedEdit', id, values)];
                    case 1:
                        _a.sent();
                        // Update or insert the rows for the parent table and the left joined
                        // tables
                        return [4 /*yield*/, this._insertOrUpdate(id, values)];
                    case 2:
                        // Update or insert the rows for the parent table and the left joined
                        // tables
                        _a.sent();
                        i = 0, ien = this._join.length;
                        _a.label = 3;
                    case 3:
                        if (!(i < ien)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._join[i].update(this, id, values)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        getId = this._pkeySubmitMerge(id, values);
                        return [4 /*yield*/, this._trigger('writeEdit', id, values)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, getId];
                }
            });
        });
    };
    Editor.prototype._upload = function (http) {
        return __awaiter(this, void 0, void 0, function () {
            var field, fieldName, i, ien, join, fields, j, jen, joinField, name_2, eventRes, upload, res, files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        field = this._findField(http.uploadField, 'name');
                        fieldName = '';
                        if (!field) {
                            // Perhaps it is in a join instance
                            for (i = 0, ien = this._join.length; i < ien; i++) {
                                join = this._join[i];
                                fields = join.fields();
                                for (j = 0, jen = fields.length; j < jen; j++) {
                                    joinField = fields[j];
                                    name_2 = join.name() + '[].' + joinField.name();
                                    if (name_2 === http.uploadField) {
                                        field = joinField;
                                        fieldName = name_2;
                                    }
                                }
                            }
                        }
                        else {
                            fieldName = field.name();
                        }
                        if (!this._uploadData) {
                            throw new Error('No upload data supplied');
                        }
                        if (!field) {
                            throw new Error('Unknown upload field name submitted');
                        }
                        return [4 /*yield*/, this._trigger('preUpload', http)];
                    case 1:
                        eventRes = _a.sent();
                        // Allow the upload to be cancelled by an event handler
                        if (eventRes === false) {
                            return [2 /*return*/];
                        }
                        upload = field.upload();
                        if (!upload) {
                            throw new Error('File uploaded to a field that does not have upload options configured');
                        }
                        return [4 /*yield*/, upload.exec(this, this._uploadData)];
                    case 2:
                        res = _a.sent();
                        if (!!res) return [3 /*break*/, 3];
                        this._out.fieldErrors.push({
                            name: fieldName,
                            status: upload.error()
                        });
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, this._fileData(upload.table(), [res])];
                    case 4:
                        files = _a.sent();
                        this._out.files = files;
                        this._out.upload = {
                            id: res
                        };
                        return [4 /*yield*/, this._trigger('postUpload', res, files, http, field)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Editor.Action = Action;
    Editor.version = '2.4.2';
    return Editor;
}(nestedData_1.default));
exports.default = Editor;

//# sourceMappingURL=editor.js.map
