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
/**
 * The MJoin class provides a one-to-many join link for Editor. This can
 * be useful in cases were an attribute can take multiple values at the
 * same time - for example cumulative security access levels.
 *
 * Typically the MJoin class should be used with a link table, but this is
 * optional. Please note that if you don't use a link table you should be
 * aware that on edit the linked rows are deleted and then reinserted, thus
 * if any values should be retained they should also be submitted.
 *
 * Please refer to the Editor Node documentation for further information
 * https://editor.datatables.net/manual/node
 *
 * @export
 * @class Mjoin
 * @extends {NestedData}
 */
var Mjoin = /** @class */ (function (_super) {
    __extends(Mjoin, _super);
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Constructor
     */
    /**
     * Creates an instance of Mjoin.
     *
     * @param {string} table Table name being joined to
     */
    function Mjoin(table) {
        var _this = _super.call(this) || this;
        _this._get = true;
        _this._set = true;
        _this._where = [];
        _this._fields = [];
        _this._links = [];
        _this._join = {
            child: '',
            parent: ''
        };
        _this._validators = [];
        _this.table(table);
        _this.name(table);
        return _this;
    }
    Mjoin.prototype.field = function (nameOrField) {
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
    Mjoin.prototype.fields = function () {
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
    Mjoin.prototype.get = function (flag) {
        if (flag === undefined) {
            return this._get;
        }
        this._get = flag;
        return this;
    };
    /**
     * Create a join link between two tables. The order of the fields does not
     * matter, but each field must contain the table name as well as the field
     * name.
     *
     * This method can be called a maximum of two times for an Mjoin instance:
     *
     * * First time, creates a link between the Editor host table and a join
     *   table
     * * Second time creates the links required for a link table.
     *
     * Please refer to the Editor Mjoin documentation for further details:
     * https://editor.datatables.net/manual/php
     *
     * @param {string} field1 Table and field name
     * @param {string} field2 Table and field name
     * @returns {Mjoin} Self for chaining
     */
    Mjoin.prototype.link = function (field1, field2) {
        if (field1.indexOf('.') === -1 || field2.indexOf('.') === -1) {
            throw new Error('Mjoin fields must contain both the table name and the column name');
        }
        if (this._links.length === 4) {
            throw new Error('Mjoin link method cannot be called more than twice for a single instance');
        }
        // Add to list - it is resolved later on
        this._links.push(field1);
        this._links.push(field2);
        return this;
    };
    Mjoin.prototype.name = function (name) {
        if (name === undefined) {
            return this._name;
        }
        this._name = name;
        return this;
    };
    Mjoin.prototype.order = function (order) {
        if (order === undefined) {
            return this._order;
        }
        this._order = order;
        return this;
    };
    Mjoin.prototype.set = function (flag) {
        if (flag === undefined) {
            return this._set;
        }
        this._set = flag;
        return this;
    };
    Mjoin.prototype.table = function (table) {
        if (table === undefined) {
            return this._table;
        }
        this._table = table;
        return this;
    };
    /**
     * Set a validator for the array of data (not on a field basis)
     *
     * @param fieldName Name of the field that any error should be shown
     *   against on the client-side
     * @param fn Callback function for validation
     */
    Mjoin.prototype.validator = function (fieldName, fn) {
        this._validators.push({
            fieldName: fieldName,
            fn: fn
        });
        return this;
    };
    Mjoin.prototype.where = function (cond) {
        if (cond === undefined) {
            return this._where;
        }
        this._where.push(cond);
        return this;
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Internal methods
     */
    /**
     * @ignore
     */
    Mjoin.prototype.data = function (editor, response) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, join, dteTable, joinField, dteTableAlias, mJoinTable, mJoinTableAlias, pkeyIsJoin, query, order, a, i, ien, field, dbField, readField, whereIn, data, i, ien, linkValue, res, joinMap, i, ien, inner, j, jen, lookup, i, ien, data, linkField, i, ien, opts, name_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._get) {
                            return [2 /*return*/];
                        }
                        this._prepare(editor);
                        fields = this.fields();
                        join = this._join;
                        // This is something that will likely come in a future version, but it
                        // is a relatively low use feature. Please get in touch if this is
                        // something you require.
                        if (editor.pkey().length > 1) {
                            throw new Error('Mjoin is not currently supported with a compound primary key for the main table');
                        }
                        if (!response.data.length) return [3 /*break*/, 2];
                        dteTable = editor.table()[0];
                        joinField = join.table ?
                            join.parent[0] :
                            join.parent;
                        dteTableAlias = dteTable.indexOf(' ') !== -1
                            ? dteTable.split(/ (as )?/i)[2]
                            : dteTable;
                        mJoinTable = this._table.indexOf(' ') !== -1
                            ? this._table.split(/ (as )?/i)[0]
                            : this._table;
                        mJoinTableAlias = this._table.indexOf(' ') !== -1
                            ? this._table.split(/ (as )?/i)[2]
                            : this._table;
                        pkeyIsJoin = joinField === editor.pkey()[0] ||
                            dteTableAlias + '.' + joinField === editor.pkey()[0];
                        query = editor.db().table(dteTable)
                            .distinct(dteTableAlias + '.' + joinField + ' as dteditor_pkey');
                        order = this.order();
                        if (order) {
                            a = order.split(' ');
                            if (a.length > 1) {
                                query.orderBy(a[0], a[1]);
                            }
                            else {
                                query.orderBy(a);
                            }
                        }
                        this._applyWhere(query);
                        for (i = 0, ien = fields.length; i < ien; i++) {
                            field = fields[i];
                            if (field.apply('get') && field.getValue() === undefined) {
                                dbField = field.dbField();
                                if (dbField.indexOf('(') !== -1) {
                                    query.select(editor.db().raw(dbField + ' as "' + dbField + '"'));
                                }
                                else if (dbField.indexOf('.') === -1) {
                                    query.select(mJoinTableAlias + '.' + dbField + ' as ' + dbField);
                                }
                                else {
                                    query.select(dbField);
                                }
                            }
                        }
                        // Create the joins
                        if (join.table) {
                            query.innerJoin(join.table, dteTableAlias + '.' + join.parent[0], '=', join.table + '.' + join.parent[1]);
                            query.innerJoin(mJoinTable + ' as ' + mJoinTableAlias, mJoinTableAlias + '.' + join.child[0], '=', join.table + '.' + join.child[1]);
                        }
                        else {
                            query.innerJoin(mJoinTable + ' as ' + mJoinTableAlias, mJoinTableAlias + '.' + join.child, '=', dteTableAlias + '.' + join.parent);
                        }
                        readField = '';
                        if (this._propExists(dteTableAlias + '.' + joinField, response.data[0])) {
                            readField = dteTableAlias + '.' + joinField;
                        }
                        else if (this._propExists(joinField.toString(), response.data[0])) {
                            readField = joinField.toString();
                        }
                        else if (!pkeyIsJoin) {
                            throw new Error('Join was performed on the field "' + readField + '" which was not ' +
                                'included in the Editor field list. The join field must be ' +
                                'included as a regular field in the Editor instance.');
                        }
                        // Get list of pkey values and apply as a WHERE IN condition
                        // This is primarily useful in server-side processing mode and when filtering
                        // the table as it means only a sub-set will be selected
                        // This is only applied for "sensible" data sets.172 It will just complicate
                        // matters for really large data sets:
                        // https://stackoverflow.com/questions/21178390/in-clause-limitation-in-sql-server
                        if (response.data.length < 1000) {
                            whereIn = [];
                            data = response.data;
                            for (i = 0, ien = data.length; i < ien; i++) {
                                linkValue = pkeyIsJoin ?
                                    data[i].DT_RowId.replace(editor.idPrefix(), '') :
                                    this._readProp(readField, data[i]);
                                whereIn.push(linkValue);
                            }
                            query.whereIn(dteTableAlias + '.' + joinField, whereIn);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        res = _a.sent();
                        joinMap = {};
                        for (i = 0, ien = res.length; i < ien; i++) {
                            inner = {};
                            for (j = 0, jen = fields.length; j < jen; j++) {
                                fields[j].write(inner, res[i]);
                            }
                            lookup = res[i].dteditor_pkey;
                            if (!joinMap[lookup]) {
                                joinMap[lookup] = [];
                            }
                            joinMap[lookup].push(inner);
                        }
                        // Loop over the data in the original response and do a join based on
                        // the mapped data
                        for (i = 0, ien = response.data.length; i < ien; i++) {
                            data = response.data[i];
                            linkField = pkeyIsJoin ?
                                data.DT_RowId.replace(editor.idPrefix(), '') :
                                this._readProp(readField, data);
                            if (joinMap[linkField]) {
                                data[this._name] = joinMap[linkField];
                            }
                            else {
                                data[this._name] = [];
                            }
                        }
                        _a.label = 2;
                    case 2:
                        i = 0, ien = fields.length;
                        _a.label = 3;
                    case 3:
                        if (!(i < ien)) return [3 /*break*/, 6];
                        return [4 /*yield*/, fields[i].optionsExec(editor.db())];
                    case 4:
                        opts = _a.sent();
                        if (opts) {
                            name_1 = this.name() + '[].' + fields[i].name();
                            response.options[name_1] = opts;
                        }
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @ignore
     */
    Mjoin.prototype.create = function (editor, parentId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var db, i, ien;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If not settable, or the many count for the join was not submitted
                        // then we do nothing
                        if (!this._set ||
                            !data[this._name] ||
                            !data[this._name + '-many-count']) {
                            return [2 /*return*/];
                        }
                        this._prepare(editor);
                        db = editor.db();
                        i = 0, ien = data[this._name].length;
                        _a.label = 1;
                    case 1:
                        if (!(i < ien)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._insert(db, parentId, data[this._name][i])];
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
    /**
     * @ignore
     */
    Mjoin.prototype.update = function (editor, parentId, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._set || !data[this._name + '-many-count']) {
                            return [2 /*return*/];
                        }
                        // WARNING - this will remove rows and then readd them. Any
                        // data not in the field list WILL BE LOST
                        return [4 /*yield*/, this.remove(editor, [parentId])];
                    case 1:
                        // WARNING - this will remove rows and then readd them. Any
                        // data not in the field list WILL BE LOST
                        _a.sent();
                        return [4 /*yield*/, this.create(editor, parentId, data)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @ignore
     */
    Mjoin.prototype.remove = function (editor, ids) {
        return __awaiter(this, void 0, void 0, function () {
            var db, join, query, i, ien, query_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this._set) {
                            return [2 /*return*/];
                        }
                        this._prepare(editor);
                        db = editor.db();
                        join = this._join;
                        if (!join.table) return [3 /*break*/, 2];
                        query = db
                            .del()
                            .from(join.table);
                        for (i = 0, ien = ids.length; i < ien; i++) {
                            query.orWhere((_a = {}, _a[join.parent[1]] = ids[i], _a));
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        query_1 = db
                            .del()
                            .from(this._table);
                        query_1.where(function () {
                            var _a;
                            for (var i = 0, ien = ids.length; i < ien; i++) {
                                query_1.orWhere((_a = {}, _a[join.child.toString()] = ids[i], _a));
                            }
                        });
                        this._applyWhere(query_1);
                        return [4 /*yield*/, query_1];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @ignore
     */
    Mjoin.prototype.validate = function (errors, editor, data, action) {
        return __awaiter(this, void 0, void 0, function () {
            var joinData, j, jen, validator, res, i, ien;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._set) {
                            return [2 /*return*/];
                        }
                        this._prepare(editor);
                        joinData = data[this._name] || [];
                        j = 0, jen = this._validators.length;
                        _a.label = 1;
                    case 1:
                        if (!(j < jen)) return [3 /*break*/, 4];
                        validator = this._validators[j];
                        return [4 /*yield*/, validator.fn(editor, action, joinData)];
                    case 2:
                        res = _a.sent();
                        if (typeof res === 'string') {
                            errors.push({
                                name: validator.fieldName,
                                status: res
                            });
                        }
                        _a.label = 3;
                    case 3:
                        j++;
                        return [3 /*break*/, 1];
                    case 4:
                        i = 0, ien = joinData.length;
                        _a.label = 5;
                    case 5:
                        if (!(i < ien)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._validateFields(errors, editor, joinData[i], this._name + '[].')];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Private methods
     */
    Mjoin.prototype._applyWhere = function (query) {
        var where = this._where;
        for (var i = 0, ien = where.length; i < ien; i++) {
            query.where(where[i]);
        }
    };
    Mjoin.prototype._insert = function (db, parentId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var join, fields, set, i, ien, field;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        join = this._join;
                        fields = this.fields();
                        if (!join.table) return [3 /*break*/, 2];
                        // Insert keys into the join table
                        return [4 /*yield*/, db
                                .insert((_a = {},
                                _a[join.parent[1]] = parentId,
                                _a[join.child[1]] = data[join.child[0]],
                                _a))
                                .from(join.table)];
                    case 1:
                        // Insert keys into the join table
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        set = (_b = {},
                            _b[join.child.toString()] = parentId,
                            _b);
                        for (i = 0, ien = fields.length; i < ien; i++) {
                            field = fields[i];
                            if (field.apply('create', data)) {
                                set[field.dbField()] = field.val('set', data);
                            }
                        }
                        return [4 /*yield*/, db
                                .insert(set)
                                .from(this._table)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Mjoin.prototype._prepare = function (editor) {
        this._editor = editor;
        var links = this._links;
        var editorTable = editor.table()[0];
        var joinTable = this.table();
        var dteTableAlias = editorTable.indexOf(' ') !== -1
            ? editorTable.split(/ (as )?/i)[2]
            : editorTable;
        if (links.length === 2) {
            // No link table
            var f1 = links[0].split('.');
            var f2 = links[1].split('.');
            if (f1[0] === dteTableAlias) {
                this._join.parent = f1[1];
                this._join.child = f2[1];
            }
            else {
                this._join.parent = f2[1];
                this._join.child = f1[1];
            }
        }
        else {
            // Link table
            var f1 = links[0].split('.');
            var f2 = links[1].split('.');
            var f3 = links[2].split('.');
            var f4 = links[3].split('.');
            // Discover the name of the link table
            if (f1[0] !== dteTableAlias && f1[0] !== joinTable) {
                this._join.table = f1[0];
            }
            else if (f2[0] !== dteTableAlias && f2[0] !== joinTable) {
                this._join.table = f2[0];
            }
            else if (f3[0] !== dteTableAlias && f3[0] !== joinTable) {
                this._join.table = f3[0];
            }
            else {
                this._join.table = f4[0];
            }
            this._join.parent = [f1[1], f2[1]];
            this._join.child = [f3[1], f4[1]];
        }
    };
    Mjoin.prototype._validateFields = function (errors, editor, data, prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, i, ien, field, validation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = this.fields();
                        i = 0, ien = fields.length;
                        _a.label = 1;
                    case 1:
                        if (!(i < ien)) return [3 /*break*/, 4];
                        field = fields[i];
                        return [4 /*yield*/, field.validate(data, editor)];
                    case 2:
                        validation = _a.sent();
                        if (validation !== true) {
                            errors.push({
                                name: prefix + field.name(),
                                status: validation
                            });
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
    return Mjoin;
}(nestedData_1.default));
exports.default = Mjoin;

//# sourceMappingURL=mjoin.js.map
