"use strict";
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
var fs = require("fs");
var path = require("path");
var mv = require("mv");
var promisify_1 = require("./promisify");
var stat = promisify_1.default(fs.stat);
var readFile = promisify_1.default(fs.readFile);
var rename = promisify_1.default(mv);
var DbOpts;
(function (DbOpts) {
    DbOpts[DbOpts["Content"] = 0] = "Content";
    DbOpts[DbOpts["ContentType"] = 1] = "ContentType";
    DbOpts[DbOpts["Extn"] = 2] = "Extn";
    DbOpts[DbOpts["Name"] = 3] = "Name";
    DbOpts[DbOpts["FileName"] = 4] = "FileName";
    DbOpts[DbOpts["FileSize"] = 5] = "FileSize";
    DbOpts[DbOpts["MimeType"] = 6] = "MimeType";
    DbOpts[DbOpts["ReadOnly"] = 7] = "ReadOnly";
    DbOpts[DbOpts["SystemPath"] = 8] = "SystemPath";
    // Note that the PHP and .NET libraries have a WebPath, but that isn't
    // available here as there isn't a good and reliable way to get the web
    // root in node (it could be anywhere!).
})(DbOpts = exports.DbOpts || (exports.DbOpts = {}));
/**
 * Upload class for Editor. This class provides the ability to easily specify
 * file upload information, specifically how the file should be recorded on
 * the server (database and file system).
 *
 * An instance of this class is attached to a field using the {@link
 * Field.upload} method. When Editor detects a file upload for that file the
 * information provided for this instance is executed.
 *
 * The configuration is primarily driven through the {@link db} and {@link
 * action} methods:
 *
 * * {@link db} Describes how information about the uploaded file is to be
 *   stored on the database.
 * * {@link action} Describes where the file should be stored on the file system
 *   and provides the option of specifying a custom action when a file is
 *   uploaded.
 *
 * Both methods are optional - you can store the file on the server using the
 * {@link db} method only if you want to store the file in the database, or if
 * you don't want to store relational data on the database us only {@link
 * action}. However, the majority of the time it is best to use both - store
 * information about the file on the database for fast retrieval (using a {@link
 * Editor.leftJoin()} for example) and the file on the file system for direct
 * web access.
 *
 * @export
 * @class Upload
 */
var Upload = /** @class */ (function () {
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Constructor
     */
    function Upload(action) {
        if (action === void 0) { action = null; }
        this._validators = [];
        this._where = [];
        if (action) {
            this.action(action);
        }
    }
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Public methods
     */
    /**
     * Set the action to take when a file is uploaded. This can be either of:
     *
     * * A string - the value given is the full system path to where the
     *   uploaded file is written to. The value given can include three "macros"
     *   which are replaced by the script dependent on the uploaded file:
     *   * `__EXTN__` - the file extension
     *   * `__NAME__` - the uploaded file's name (including the extension)
     *   * `__ID__` - Database primary key value if the {@link db} method is
     *     used.
     * * A closure - if a function is given the responsibility of what to do
     *   with the uploaded file is transferred to this function. That will
     *   typically involve writing it to the file system so it can be used
     *   later.
     *
     * @param {(string|Function)} action Upload action
     * @returns {Upload} Self for chaining
     */
    Upload.prototype.action = function (action) {
        this._action = action;
        return this;
    };
    /**
     * Database configuration method. When used, this method will tell Editor
     * what information you want written to a database on file upload, should
     * you wish to store relational information about your file on the database
     * (this is generally recommended).
     *
     * @param {string} table The name of the table where the file information
     *     should be stored
     * @param {string} pkey Primary key column name. The `Upload` class
     *     requires that the database table have a single primary key so each
     *     row can be uniquely identified.
     * @param {object} fields A list of the fields to be written to on upload.
     *     The property names are the database columns and the values can be
     *     defined by the constants of this class. The value can also be a
     *     string or a closure function if you wish to send custom information
     *     to the database.
     * @returns {Upload} Self for chaining
     */
    Upload.prototype.db = function (table, pkey, fields) {
        this._dbTable = table;
        this._dbPkey = pkey;
        this._dbFields = fields;
        return this;
    };
    /**
     * Set a callback function that is used to remove files which no longer have
     * a reference in a source table.
     *
     * @param {(string|Function)} tableField Table field to be used for the delete match
     * @param {Function} [callback=null] Function that will be executed on clean. It is
     *   given an array of information from the database about the orphaned
     *   rows, and can return true to indicate that the rows should be
     *   removed from the database. Any other return value (including none)
     *   will result in the records being retained.
     * @returns {Upload} Self for chaining
     */
    Upload.prototype.dbClean = function (tableField, callback) {
        if (callback === void 0) { callback = null; }
        // Argument swapping
        if (typeof tableField === 'function') {
            this._dbCleanTableField = null;
            this._dbCleanCallback = tableField;
        }
        else {
            this._dbCleanTableField = tableField;
            this._dbCleanCallback = callback;
        }
        return this;
    };
    /**
     * Add a validation method to check file uploads. Multiple validators can be
     * added by calling this method multiple times - they will be executed in
     * sequence when a file has been uploaded.
     *
     * @param {any} fn Validation function. A files parameter is
     *   passed in for the uploaded file and the return is either a string
     *   (validation failed and error message), or `true` (validation passed).
     * @returns {Upload} Self for chaining
     */
    Upload.prototype.validator = function (fn) {
        this._validators.push(fn);
        return this;
    };
    /**
     * Add a condition to the data to be retrieved from the database. This
     * must be given as a function to be executed (usually anonymous) and
     * will be passed in a single argument, the `Query` object, to which
     * conditions can be added. Multiple calls to this method can be made.
     *
     * @param {any} fn Knex WHERE condition
     * @returns {Upload} Self for chaining
     */
    Upload.prototype.where = function (fn) {
        this._where.push(fn);
        return this;
    };
    /*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
     * Internal methods
     */
    /**
     * @ignore
     */
    Upload.prototype.data = function (db, ids) {
        if (ids === void 0) { ids = null; }
        return __awaiter(this, void 0, void 0, function () {
            var query, keys, i, ien, key, i, ien, result, out, i, ien;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._dbTable) {
                            return [2 /*return*/, null];
                        }
                        query = db
                            .select(this._dbPkey)
                            .from(this._dbTable);
                        keys = Object.keys(this._dbFields);
                        for (i = 0, ien = keys.length; i < ien; i++) {
                            key = keys[i];
                            if (this._dbFields[key] !== DbOpts.Content) {
                                query.select(key);
                            }
                        }
                        if (ids !== null) {
                            query.whereIn(this._dbPkey, ids);
                        }
                        for (i = 0, ien = this._where.length; i < ien; i++) {
                            query.where(this._where[i]);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        result = _a.sent();
                        out = {};
                        for (i = 0, ien = result.length; i < ien; i++) {
                            out[result[i][this._dbPkey]] = result[i];
                        }
                        return [2 /*return*/, out];
                }
            });
        });
    };
    /**
     * @ignore
     */
    Upload.prototype.dbCleanExec = function (editor, field) {
        return __awaiter(this, void 0, void 0, function () {
            var tables;
            return __generator(this, function (_a) {
                tables = editor.table();
                this._dbClean(editor.db(), tables[0], field.dbField());
                return [2 /*return*/];
            });
        });
    };
    /**
     * @ignore
     */
    Upload.prototype.error = function () {
        return this._error;
    };
    /**
     * @ignore
     */
    Upload.prototype.exec = function (editor, upload) {
        return __awaiter(this, void 0, void 0, function () {
            var id, fileInfo, a, i, ien, result, fields, i, ien, prop, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, stat(upload.upload.file)];
                    case 1:
                        fileInfo = _a.sent();
                        upload.upload.size = fileInfo.size;
                        a = upload.upload.filename.split('.');
                        upload.upload.extn = a.length > 1 ?
                            a.pop() :
                            '';
                        upload.upload.name = a.join('.');
                        i = 0, ien = this._validators.length;
                        _a.label = 2;
                    case 2:
                        if (!(i < ien)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._validators[i](upload.upload)];
                    case 3:
                        result = _a.sent();
                        if (typeof result === 'string') {
                            this._error = result;
                            return [2 /*return*/, null];
                        }
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        if (!this._dbTable) return [3 /*break*/, 7];
                        fields = Object.keys(this._dbFields);
                        for (i = 0, ien = fields.length; i < ien; i++) {
                            prop = this._dbFields[fields[i]];
                            // We can't know what the path is, if it has moved into place
                            // by an external function - throw an error if this does happen
                            if (typeof this._action !== 'string' && prop === DbOpts.SystemPath) {
                                this._error = 'Cannot set path information in the database ' +
                                    'if a custom method is used to save the file.';
                                return [2 /*return*/, null];
                            }
                        }
                        return [4 /*yield*/, this._dbExec(editor.db(), upload)];
                    case 6:
                        // Commit to the database
                        id = _a.sent();
                        _a.label = 7;
                    case 7: return [4 /*yield*/, this._actionExec(id, upload)];
                    case 8:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    /**
     * @ignore
     */
    Upload.prototype.pkey = function () {
        return this._dbPkey;
    };
    /**
     * @ignore
     */
    Upload.prototype.table = function () {
        return this._dbTable;
    };
    /*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
     * Private methods
     */
    Upload.prototype._actionExec = function (id, files) {
        return __awaiter(this, void 0, void 0, function () {
            var res, to, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(typeof this._action === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._action(files.upload, id)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                    case 2:
                        to = this._substitute(this._action, files.upload.file, id);
                        to = path.normalize(to);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, (rename(files.upload.file, to, { mkdirp: true }))];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        this._error = 'An error occurred while moving the uploaded file.';
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/, id !== null ?
                            id :
                            to];
                }
            });
        });
    };
    Upload.prototype._dbClean = function (db, editorTable, fieldName) {
        return __awaiter(this, void 0, void 0, function () {
            var callback, that, table, field, a, fields, columns, query, i, ien, column, prop, rows, result, queryDel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        callback = this._dbCleanCallback;
                        that = this;
                        if (!this._dbTable || !callback) {
                            return [2 /*return*/];
                        }
                        // If there is a table / field that we should use to check if the value
                        // is in use, then use that. Otherwise we'll try to use the information
                        // from the Editor / Field instance.
                        if (this._dbCleanTableField) {
                            fieldName = this._dbCleanTableField;
                        }
                        a = fieldName.split('.');
                        if (a.length === 1) {
                            table = editorTable;
                            field = a[0];
                        }
                        else if (a.length === 2) {
                            table = a[0];
                            field = a[1];
                        }
                        else {
                            table = a[1];
                            field = a[2];
                        }
                        fields = this._dbFields;
                        columns = Object.keys(fields);
                        query = db
                            .select(this._dbPkey)
                            .from(this._dbTable);
                        for (i = 0, ien = columns.length; i < ien; i++) {
                            column = columns[i];
                            prop = fields[column];
                            if (prop !== DbOpts.Content) {
                                query.select(column);
                            }
                        }
                        query.whereNotIn(this._dbPkey, function () {
                            this.select(field).from(table).whereNotNull(field);
                        });
                        return [4 /*yield*/, query];
                    case 1:
                        rows = _a.sent();
                        if (rows.length === 0) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, callback(rows)];
                    case 2:
                        result = _a.sent();
                        if (!(result === true)) return [3 /*break*/, 4];
                        queryDel = db
                            .from(this._dbTable)
                            .where(function () {
                            var _a;
                            for (var i = 0, ien = rows.length; i < ien; i++) {
                                this.orWhere((_a = {}, _a[that._dbPkey] = rows[i][that._dbPkey], _a));
                            }
                        });
                        return [4 /*yield*/, queryDel.del()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Upload.prototype._dbExec = function (db, files) {
        return __awaiter(this, void 0, void 0, function () {
            var pathFields, fields, columns, set, upload, i, ien, column, prop, _a, _b, _c, val, res, id, pathKeys, toSet, i, ien, key;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        pathFields = {};
                        fields = this._dbFields;
                        columns = Object.keys(fields);
                        set = {};
                        upload = files.upload;
                        i = 0, ien = columns.length;
                        _e.label = 1;
                    case 1:
                        if (!(i < ien)) return [3 /*break*/, 13];
                        column = columns[i];
                        prop = fields[column];
                        _a = prop;
                        switch (_a) {
                            case DbOpts.ReadOnly: return [3 /*break*/, 2];
                            case DbOpts.Content: return [3 /*break*/, 3];
                            case DbOpts.ContentType: return [3 /*break*/, 5];
                            case DbOpts.MimeType: return [3 /*break*/, 5];
                            case DbOpts.Extn: return [3 /*break*/, 6];
                            case DbOpts.FileName: return [3 /*break*/, 7];
                            case DbOpts.Name: return [3 /*break*/, 8];
                            case DbOpts.FileSize: return [3 /*break*/, 9];
                            case DbOpts.SystemPath: return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 11];
                    case 2: return [3 /*break*/, 12];
                    case 3:
                        _b = set;
                        _c = column;
                        return [4 /*yield*/, readFile(upload.file)];
                    case 4:
                        _b[_c] = _e.sent();
                        return [3 /*break*/, 12];
                    case 5:
                        set[column] = upload.mimetype;
                        return [3 /*break*/, 12];
                    case 6:
                        set[column] = upload.extn;
                        return [3 /*break*/, 12];
                    case 7:
                        set[column] = upload.filename;
                        return [3 /*break*/, 12];
                    case 8:
                        set[column] = upload.name;
                        return [3 /*break*/, 12];
                    case 9:
                        set[column] = upload.size;
                        return [3 /*break*/, 12];
                    case 10:
                        pathFields[column] = this._action;
                        set[column] = '-'; // Use a temporary value to avoid cases
                        return [3 /*break*/, 12]; // where the db will reject empty values
                    case 11:
                        val = typeof prop === 'function' ?
                            prop(db, upload) :
                            prop;
                        if (typeof val === 'string' && val.match(/\{.*\}/)) {
                            pathFields[column] = val;
                            set[column] = '-';
                        }
                        else {
                            set[column] = val;
                        }
                        return [3 /*break*/, 12];
                    case 12:
                        i++;
                        return [3 /*break*/, 1];
                    case 13: return [4 /*yield*/, db
                            .insert(set)
                            .from(this._dbTable)
                            .returning(this._dbPkey)];
                    case 14:
                        res = _e.sent();
                        id = res[0];
                        pathKeys = Object.keys(pathFields);
                        if (!pathKeys.length) return [3 /*break*/, 16];
                        toSet = {};
                        for (i = 0, ien = pathKeys.length; i < ien; i++) {
                            key = pathKeys[i];
                            toSet[key] = this._substitute(pathFields[key], upload.file, id);
                        }
                        return [4 /*yield*/, db
                                .update(toSet)
                                .from(this._dbTable)
                                .where((_d = {}, _d[this._dbPkey] = id, _d))];
                    case 15:
                        _e.sent();
                        _e.label = 16;
                    case 16: return [2 /*return*/, id];
                }
            });
        });
    };
    Upload.prototype._substitute = function (convert, uploadPath, id) {
        var a = uploadPath.toString().split('/');
        var fileName = a.pop();
        var fileParts = fileName.split('.');
        var extn = fileParts.pop();
        var namePart = fileParts.join('.');
        var to = convert.toString();
        to = to.replace('{name}', namePart);
        to = to.replace('{id}', id);
        to = to.replace('{extn}', extn);
        return to;
    };
    Upload.Db = DbOpts; // legacy
    Upload.DbOpts = DbOpts;
    return Upload;
}());
exports.default = Upload;

//# sourceMappingURL=upload.js.map
