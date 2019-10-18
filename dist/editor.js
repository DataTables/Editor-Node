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
var crc = require("crc");
var field_1 = require("./field");
var nestedData_1 = require("./nestedData");
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
})(Action = exports.Action || (exports.Action = {}));
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
        _this._tryCatch = false;
        _this._debug = false;
        _this._debugInfo = [];
        _this._leftJoinRemove = false;
        _this._schema = null;
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
                return this._knexTransaction;
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
    /**
     * Add a left join condition to the Editor instance, allowing it to operate
     * over multiple tables. Multiple `leftJoin()` calls can be made for a
     * single Editor instance to join multiple tables.
     *
     * A left join is the most common type of join that is used with Editor
     * so this method is provided to make its use very easy to configure. Its
     * parameters are basically the same as writing an SQL left join statement,
     * but in this case Editor will handle the create, update and remove
     * requirements of the join for you:
     *
     * * Create - On create Editor will insert the data into the primary table
     *   and then into the joined tables - selecting the required data for each
     *   table.
     * * Edit - On edit Editor will update the main table, and then either
     *   update the existing rows in the joined table that match the join and
     *   edit conditions, or insert a new row into the joined table if required.
     * * Remove - On delete Editor will remove the main row and then loop over
     *   each of the joined tables and remove the joined data matching the join
     *   link from the main table.
     *
     * Please note that when using join tables, Editor requires that you fully
     * qualify each field with the field's table name. SQL can result table
     * names for ambiguous field names, but for Editor to provide its full CRUD
     * options, the table name must also be given. For example the field
     * `first_name` in the table `users` would be given as `users.first_name`.
     * @param {string} table Table name to do a join onto
     * @param {string} field1 Field from the parent table to use as the join link
     * @param {string} operator Join condition (`=`, '<`, etc)
     * @param {string} field2 Field from the child table to use as the join link
     * @returns {Editor} Self for chaining
     */
    Editor.prototype.leftJoin = function (table, field1, operator, field2) {
        this._leftJoin.push({
            field1: field1,
            field2: field2,
            operator: operator,
            table: table,
        });
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
            var that, run;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        that = this;
                        run = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var e_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!that._tryCatch) return [3 /*break*/, 5];
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, that._process(data, files)];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 3:
                                            e_1 = _a.sent();
                                            that._out.error = e_1.message;
                                            return [3 /*break*/, 4];
                                        case 4: return [3 /*break*/, 7];
                                        case 5: return [4 /*yield*/, that._process(data, files)];
                                        case 6:
                                            _a.sent();
                                            _a.label = 7;
                                        case 7: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        if (!this._transaction) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._db.transaction(function (trx) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                that._knexTransaction = trx;
                                                return [4 /*yield*/, run()];
                                            case 1:
                                                _a.sent();
                                                that._knexTransaction = null;
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, run()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, this];
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
            var keys, fields, idPrefix, i, ien, values, j, jen, field, validation, j, jen;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (http.action !== 'create' && http.action !== 'edit') {
                            return [2 /*return*/, true];
                        }
                        keys = Object.keys(http.data);
                        fields = this.fields();
                        idPrefix = this.idPrefix();
                        i = 0, ien = keys.length;
                        _a.label = 1;
                    case 1:
                        if (!(i < ien)) return [3 /*break*/, 10];
                        values = http.data[keys[i]];
                        j = 0, jen = fields.length;
                        _a.label = 2;
                    case 2:
                        if (!(j < jen)) return [3 /*break*/, 5];
                        field = fields[j];
                        return [4 /*yield*/, field.validate(values, this, keys[i].replace(idPrefix, ''))];
                    case 3:
                        validation = _a.sent();
                        if (validation !== true) {
                            errors.push({
                                name: field.name(),
                                status: validation,
                            });
                        }
                        _a.label = 4;
                    case 4:
                        j++;
                        return [3 /*break*/, 2];
                    case 5:
                        j = 0, jen = this._join.length;
                        _a.label = 6;
                    case 6:
                        if (!(j < jen)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this._join[j].validate(errors, this, values, http.action)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        j++;
                        return [3 /*break*/, 6];
                    case 9:
                        i++;
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/, errors.length > 0 ?
                            false :
                            true];
                }
            });
        });
    };
    Editor.prototype.validator = function (fn) {
        if (fn === undefined) {
            return this._validators;
        }
        this._validators.push(fn);
        return this;
    };
    Editor.prototype.where = function () {
        var _a;
        var cond = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cond[_i] = arguments[_i];
        }
        if (cond.length === 0) {
            return this._where;
        }
        (_a = this._where).push.apply(_a, cond);
        return this;
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
            var cancel, fields, pkeys, query, options, i, ien, i, ien, dbField, ssp, result, out, i, ien, inner, j, jen, i, ien, opts, response, i, ien, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._trigger('preGet', id)];
                    case 1:
                        cancel = _b.sent();
                        if (cancel === false) {
                            return [2 /*return*/, {}];
                        }
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
                        this._performLeftJoin(query);
                        return [4 /*yield*/, this._ssp(query, http)];
                    case 2:
                        ssp = _b.sent();
                        if (id !== null) {
                            query.where(this.pkeyToObject(id, true));
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        result = _b.sent();
                        if (!result) {
                            throw new Error('Error executing SQL for data get. Enable SQL debug using ' +
                                '`debug: true` in your Knex db configuration');
                        }
                        out = [];
                        for (i = 0, ien = result.length; i < ien; i++) {
                            inner = {
                                DT_RowId: this.idPrefix() + this.pkeyToValue(result[i], true)
                            };
                            for (j = 0, jen = fields.length; j < jen; j++) {
                                if (fields[j].apply('get')) {
                                    fields[j].write(inner, result[i]);
                                }
                            }
                            out.push(inner);
                        }
                        if (!(id === null)) return [3 /*break*/, 7];
                        i = 0, ien = fields.length;
                        _b.label = 4;
                    case 4:
                        if (!(i < ien)) return [3 /*break*/, 7];
                        return [4 /*yield*/, fields[i].optionsExec(this.db())];
                    case 5:
                        opts = _b.sent();
                        if (opts) {
                            options[fields[i].name()] = opts;
                        }
                        _b.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 4];
                    case 7:
                        response = {
                            data: out,
                            draw: ssp.draw,
                            files: {},
                            options: options,
                            recordsFiltered: ssp.recordsFiltered,
                            recordsTotal: ssp.recordsTotal
                        };
                        i = 0, ien = this._join.length;
                        _b.label = 8;
                    case 8:
                        if (!(i < ien)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this._join[i].data(this, response)];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10:
                        i++;
                        return [3 /*break*/, 8];
                    case 11:
                        _a = response;
                        return [4 /*yield*/, this._fileData(null, null, response.data)];
                    case 12:
                        _a.files = _b.sent();
                        return [4 /*yield*/, this._trigger('postGet', id, out)];
                    case 13:
                        _b.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Editor.prototype._getWhere = function (query) {
        var where = this.where();
        for (var i = 0, ien = where.length; i < ien; i++) {
            query.where(where[i]);
        }
    };
    Editor.prototype._insert = function (values) {
        return __awaiter(this, void 0, void 0, function () {
            var id, i, ien, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Only allow a composite insert if the values for the key are
                        // submitted. This is required because there is no reliable way in MySQL
                        // to return the newly inserted row, so we can't know any newly
                        // generated values.
                        this._pkeyValidateInsert(values);
                        return [4 /*yield*/, this._insertOrUpdate(null, values)];
                    case 1:
                        id = _a.sent();
                        if (id === null) {
                            return [2 /*return*/, null];
                        }
                        // Was the primary key altered as part of the edit, if so use the
                        // submitted values
                        id = this._pkey.length > 1 ?
                            this.pkeyToValue(values) :
                            this._pkeySubmitMerge(id, values);
                        i = 0, ien = this._join.length;
                        _a.label = 2;
                    case 2:
                        if (!(i < ien)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._join[i].create(this, id, values)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this._trigger('writeCreate', id, values)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this._get(id)];
                    case 7:
                        row = _a.sent();
                        row = row.data.length > 0 ?
                            row.data[0] :
                            null;
                        return [4 /*yield*/, this._trigger('postCreate', id, values, row)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/, row];
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
                            .insert(Object.assign({}, set, where))];
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
    Editor.prototype._performLeftJoin = function (query) {
        var _loop_1 = function (i, ien) {
            var join = this_1._leftJoin[i];
            query.leftJoin(join.table, function () {
                this.on(join.field1, join.operator, join.field2);
            });
        };
        var this_1 = this;
        for (var i = 0, ien = this._leftJoin.length; i < ien; i++) {
            _loop_1(i, ien);
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
            var _i, _a, validator, ret, action, outData, keys, i, ien, cancel, idSrc, values, id, valid, i, ien, d, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this._out = {
                            cancelled: [],
                            data: [],
                            fieldErrors: []
                        };
                        this._processData = data;
                        this._uploadData = upload;
                        this._formData = data.data ? data.data : null;
                        this._prepJoin();
                        _i = 0, _a = this._validators;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        validator = _a[_i];
                        return [4 /*yield*/, validator(this, data.action, data)];
                    case 2:
                        ret = _c.sent();
                        if (typeof ret === 'string') {
                            this._out.error = ret;
                            return [3 /*break*/, 4];
                        }
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (data.action && data.action !== 'upload' && !data.data) {
                            this._out.error = 'No data detected. Have you used `{extended: true}` for `bodyParser`?';
                        }
                        action = Editor.action(data);
                        if (!!this._out.error) return [3 /*break*/, 28];
                        if (!(action === Action.Read)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._get(null, data)];
                    case 5:
                        outData = _c.sent();
                        this._out.data = outData.data;
                        this._out.draw = outData.draw;
                        this._out.files = outData.files;
                        this._out.options = outData.options;
                        this._out.recordsTotal = outData.recordsTotal;
                        this._out.recordsFiltered = outData.recordsFiltered;
                        return [3 /*break*/, 28];
                    case 6:
                        if (!(action === Action.Upload)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._upload(data)];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 28];
                    case 8:
                        if (!(action === Action.Delete)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this._remove(data)];
                    case 9:
                        _c.sent();
                        return [4 /*yield*/, this._fileClean()];
                    case 10:
                        _c.sent();
                        return [3 /*break*/, 28];
                    case 11:
                        if (!(action === Action.Create || action === Action.Edit)) return [3 /*break*/, 28];
                        keys = Object.keys(data.data);
                        i = 0, ien = keys.length;
                        _c.label = 12;
                    case 12:
                        if (!(i < ien)) return [3 /*break*/, 18];
                        cancel = null;
                        idSrc = keys[i];
                        values = data.data[keys[i]];
                        if (!(action === Action.Create)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this._trigger('preCreate', values)];
                    case 13:
                        cancel = _c.sent();
                        return [3 /*break*/, 16];
                    case 14:
                        id = idSrc.replace(this.idPrefix(), '');
                        return [4 /*yield*/, this._trigger('preEdit', id, values)];
                    case 15:
                        cancel = _c.sent();
                        _c.label = 16;
                    case 16:
                        // One of the event handlers returned false - don't continue
                        if (cancel === false) {
                            // Remove the data from the data set so it won't be processed
                            delete data.data[idSrc];
                            // Tell the client-side we aren't updating this row
                            this._out.cancelled.push(idSrc);
                        }
                        _c.label = 17;
                    case 17:
                        i++;
                        return [3 /*break*/, 12];
                    case 18: return [4 /*yield*/, this.validate(this._out.fieldErrors, data)];
                    case 19:
                        valid = _c.sent();
                        if (!valid) return [3 /*break*/, 28];
                        keys = Object.keys(data.data);
                        i = 0, ien = keys.length;
                        _c.label = 20;
                    case 20:
                        if (!(i < ien)) return [3 /*break*/, 26];
                        if (!(action === Action.Create)) return [3 /*break*/, 22];
                        return [4 /*yield*/, this._insert(data.data[keys[i]])];
                    case 21:
                        _b = _c.sent();
                        return [3 /*break*/, 24];
                    case 22: return [4 /*yield*/, this._update(keys[i], data.data[keys[i]])];
                    case 23:
                        _b = _c.sent();
                        _c.label = 24;
                    case 24:
                        d = _b;
                        if (d !== null) {
                            this._out.data.push(d);
                        }
                        _c.label = 25;
                    case 25:
                        i++;
                        return [3 /*break*/, 20];
                    case 26: return [4 /*yield*/, this._fileClean()];
                    case 27:
                        _c.sent();
                        _c.label = 28;
                    case 28:
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
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    Editor.prototype._removeTable = function (table, ids, pkey) {
        if (pkey === void 0) { pkey = null; }
        return __awaiter(this, void 0, void 0, function () {
            var count, fields, tableAlias, i, ien, dbField, q, _loop_2, this_2, i, ien;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (pkey === null) {
                            pkey = this.pkey();
                        }
                        count = 0;
                        fields = this.fields();
                        tableAlias = this._alias(table, 'alias');
                        for (i = 0, ien = fields.length; i < ien; i++) {
                            dbField = fields[i].dbField();
                            if (dbField.indexOf('.') === -1 ||
                                (this._part(dbField, 'table') === tableAlias && fields[i].set() !== field_1.SetType.None)) {
                                count++;
                            }
                        }
                        if (!(count > 0)) return [3 /*break*/, 2];
                        q = this.db().from(this._alias(table, 'orig'));
                        _loop_2 = function (i, ien) {
                            var cond = this_2.pkeyToObject(ids[i], true, pkey);
                            q.orWhere(function () {
                                this.where(cond);
                            });
                        };
                        this_2 = this;
                        for (i = 0, ien = ids.length; i < ien; i++) {
                            _loop_2(i, ien);
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
                        this._performLeftJoin(setCount);
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
                            this._performLeftJoin(fullCount);
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
                            // Nasty hack for Postgres
                            if (_this._db.client.config.client === 'psql') {
                                q.orWhere(field + '::text', 'ILIKE', '%' + http.search.value + '%');
                            }
                            else {
                                q.orWhere(field, 'LIKE', '%' + http.search.value + '%');
                            }
                        }
                    }
                }
            });
        }
        // Column filter
        for (var i = 0, ien = http.columns.length; i < ien; i++) {
            var column = http.columns[i];
            var search = column.search.value;
            if (search !== '' && column.searchable.toString() === 'true') {
                // Nasty hack for Postgres
                if (this._db.client.config.client === 'psql') {
                    query.where(this._sspField(http, i) + '::text', 'ILIKE', '%' + search + '%');
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
        for (var i = 0, ien = http.order.length; i < ien; i++) {
            var order = http.order[i];
            query.orderBy(this._sspField(http, order.column), order.dir === 'asc' ? 'asc' : 'desc');
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
            var i, ien, getId, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = id.replace(this.idPrefix(), '');
                        // Update or insert the rows for the parent table and the left joined
                        // tables
                        return [4 /*yield*/, this._insertOrUpdate(id, values)];
                    case 1:
                        // Update or insert the rows for the parent table and the left joined
                        // tables
                        _a.sent();
                        i = 0, ien = this._join.length;
                        _a.label = 2;
                    case 2:
                        if (!(i < ien)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._join[i].update(this, id, values)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        getId = this._pkeySubmitMerge(id, values);
                        return [4 /*yield*/, this._trigger('writeEdit', id, values)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this._get(getId)];
                    case 7:
                        row = _a.sent();
                        row = row.data.length > 0 ?
                            row.data[0] :
                            null;
                        return [4 /*yield*/, this._trigger('postEdit', id, values, row)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/, row];
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
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this._fileData(upload.table(), [res])];
                    case 4:
                        files = _a.sent();
                        this._out.files = files;
                        this._out.upload = {
                            id: res
                        };
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Editor.Action = Action;
    Editor.version = '1.9.2';
    return Editor;
}(nestedData_1.default));
exports.default = Editor;

//# sourceMappingURL=editor.js.map
