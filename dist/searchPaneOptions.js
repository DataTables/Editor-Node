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
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
/**
 * The Options class provides a convenient method of specifying where Editor
 * should get the list of options for a `select`, `radio` or `checkbox` field.
 * This is normally from a table that is _left joined_ to the main table being
 * edited, and a list of the values available from the joined table is shown to
 * the end user to let them select from.
 *
 * `Options` instances are used with the {@link Field.options} method.
 *
 * @export
 * @class Options
 */
var SearchPaneOptions = /** @class */ (function () {
    function SearchPaneOptions() {
        this._leftJoin = [];
        this._manualOpts = [];
    }
    SearchPaneOptions.prototype.label = function (label) {
        if (label === undefined) {
            return this._label;
        }
        this._label = Array.isArray(label) ?
            label :
            [label];
        return this;
    };
    SearchPaneOptions.prototype.limit = function (limit) {
        if (limit === undefined) {
            return this._limit;
        }
        this._limit = limit;
        return this;
    };
    SearchPaneOptions.prototype.order = function (order) {
        if (order === undefined) {
            return this._order;
        }
        this._order = order;
        return this;
    };
    SearchPaneOptions.prototype.render = function (fn) {
        if (fn === undefined) {
            return this._renderer;
        }
        this._renderer = fn;
        return this;
    };
    SearchPaneOptions.prototype.table = function (table) {
        if (table === undefined) {
            return this._table;
        }
        this._table = table;
        return this;
    };
    SearchPaneOptions.prototype.value = function (value) {
        if (value === undefined) {
            return this._value;
        }
        this._value = value;
        return this;
    };
    SearchPaneOptions.prototype.where = function (where) {
        if (where === undefined) {
            return this._where;
        }
        this._where = where;
        return this;
    };
    SearchPaneOptions.prototype.leftJoin = function (table, field1, operator, field2) {
        this._leftJoin.push({
            field1: field1,
            field2: field2,
            operator: operator,
            table: table
        });
        return this;
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Internal methods
     */
    /**
     * @ignore
     */
    SearchPaneOptions.prototype.exec = function (field, editor, http, fieldsIn, leftJoinIn) {
        return __awaiter(this, void 0, void 0, function () {
            var label, value, table, formatter, join, fields, db, query, _loop_1, _i, fields_1, fie, q, _a, join_1, joiner, res, cts, out, _b, res_1, recordCou, set, _c, cts_1, recordTot;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        formatter = this._renderer;
                        join = this._leftJoin;
                        fields = fieldsIn;
                        if (this._value === undefined) {
                            value = field._spopts._label !== undefined ?
                                field._spopts._label[0] :
                                value = field._name.split('.')[1];
                        }
                        else {
                            value = this._value.indexOf('.') === -1 ?
                                this._value :
                                this._value.split('.')[1];
                        }
                        if (this._label === undefined) {
                            label = value;
                        }
                        else {
                            label = this._label[0].indexOf('.') === -1 ?
                                this._label :
                                this._label[0].split('.')[1];
                        }
                        table = this._table === undefined ?
                            editor._table[0] :
                            this._table;
                        if (leftJoinIn !== undefined && leftJoinIn !== null) {
                            join = leftJoinIn;
                        }
                        db = editor.db();
                        // Create a list of the fields that we need to get from the db
                        // let fields = [ value ].concat(label);
                        // We need a default formatter if one isn't provided
                        if (!formatter) {
                            formatter = function (row) {
                                var a = [];
                                for (var i = 0, ien = label.length; i < ien; i++) {
                                    a.push(row[label[i]]);
                                }
                                return a.join(' ');
                            };
                        }
                        query = db
                            .select(label + ' as label', value + ' as value')
                            .count({ count: '*' })
                            .from(table)
                            .distinct()
                            .groupBy('value');
                        if (http.searchPanes !== undefined) {
                            _loop_1 = function (fie) {
                                if (http.searchPanes[fie._name] !== undefined) {
                                    query.where(function () {
                                        for (var _i = 0, _a = http.searchPanes[fie._name]; _i < _a.length; _i++) {
                                            var opt = _a[_i];
                                            this.orWhere(fie._name, opt);
                                        }
                                    });
                                }
                            };
                            for (_i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                                fie = fields_1[_i];
                                _loop_1(fie);
                            }
                        }
                        q = db
                            .select(label + ' as label', value + ' as value')
                            .count({ total: '*' })
                            .from(table)
                            .distinct()
                            .groupBy('value');
                        if (this._where) {
                            q.where(this._where);
                        }
                        if (join !== null && join !== undefined) {
                            for (_a = 0, join_1 = join; _a < join_1.length; _a++) {
                                joiner = join_1[_a];
                                q.leftJoin(joiner.table, joiner.field1, joiner.field2);
                                query.leftJoin(joiner.table, joiner.field1, joiner.field2);
                            }
                        }
                        if (this._order) {
                            // For cases where we are ordering by a field which isn't included in the list
                            // of fields to display, we need to add the ordering field, due to the
                            // select distinct.
                            this._order.split(',').forEach(function (val) {
                                var fie = val.toLocaleLowerCase()
                                    .replace(' asc', '')
                                    .replace('desc', '')
                                    .trim();
                                if (!fields.includes(fie)) {
                                    q.select(fie);
                                }
                            });
                            q.orderBy(this._order);
                        }
                        if (this._limit) {
                            q.limit(this.limit());
                        }
                        return [4 /*yield*/, q];
                    case 1:
                        res = _d.sent();
                        return [4 /*yield*/, query];
                    case 2:
                        cts = _d.sent();
                        out = [];
                        // Create the output array
                        for (_b = 0, res_1 = res; _b < res_1.length; _b++) {
                            recordCou = res_1[_b];
                            set = false;
                            for (_c = 0, cts_1 = cts; _c < cts_1.length; _c++) {
                                recordTot = cts_1[_c];
                                if (recordTot.value === recordCou.value) {
                                    out.push({
                                        count: recordTot.count,
                                        label: recordCou.label,
                                        total: recordCou.total,
                                        value: recordCou.value
                                    });
                                    set = true;
                                }
                            }
                            if (!set) {
                                out.push({
                                    count: 0,
                                    label: recordCou.label,
                                    total: recordCou.total,
                                    value: recordCou.value
                                });
                            }
                        }
                        // Stick on any extra manually added options
                        if (this._manualOpts.length) {
                            out = out.concat(this._manualOpts);
                        }
                        // Only sort if there was no SQL order field
                        if (!this._order) {
                            out.sort(function (a, b) {
                                if (isNumeric(a) && isNumeric(b)) {
                                    return (a.label * 1) - (b.label * 1);
                                }
                                return a.label < b.label ?
                                    -1 : a.label > b.label ?
                                    1 :
                                    0;
                            });
                        }
                        return [2 /*return*/, out];
                }
            });
        });
    };
    SearchPaneOptions.prototype.getWhere = function (query) {
        for (var i = 0; i < this._where.length; i++) {
            if (typeof (this.where[i]) === 'function') {
                this.where[i](query);
            }
            else {
                this.where(query);
            }
        }
        return this;
    };
    SearchPaneOptions.prototype.performLeftJoin = function (query) {
        if (this._leftJoin.length > 0) {
            for (var _i = 0, _a = this._leftJoin; _i < _a.length; _i++) {
                var point = _a[_i];
                var join = point;
            }
        }
    };
    return SearchPaneOptions;
}());
exports.default = SearchPaneOptions;

//# sourceMappingURL=searchPaneOptions.js.map
