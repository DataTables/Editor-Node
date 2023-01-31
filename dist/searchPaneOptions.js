"use strict";
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
var helpers_1 = require("./helpers");
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
    /**
     * Set the method to use for a leftJoin condition if one is to be applied
     * to the query to retrieve data from two tables
     *
     * @param table the table for the join
     * @param field1 the first field
     * @param operator operator for the join
     * @param field2 the second field
     */
    SearchPaneOptions.prototype.leftJoin = function (table, field1, operator, field2) {
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
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Internal methods
     */
    /**
     * Execution function for getting the SearchPane options
     * @param field The field to retrieve data from
     * @param editor The editor instance
     * @param http The http sent to the server
     * @param fieldsIn All of the fields
     * @param leftJoinIn Info for a leftJoin if required
     */
    SearchPaneOptions.prototype.exec = function (field, editor, http, fieldsIn, leftJoinIn) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, db, viewCount, viewTotal, cascade, entries, value, table, readTable, label, formatter, join, i, found, j, q, rows, values, selected, i, query, _loop_1, _i, fields_1, fie, entriesRows, out, i, row, value_1, total, count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = fieldsIn;
                        db = editor.db();
                        viewCount = http.searchPanes_options
                            ? http.searchPanes_options.viewCount === 'true'
                            : true;
                        viewTotal = http.searchPanes_options
                            ? http.searchPanes_options.viewTotal === 'true'
                            : false;
                        cascade = http.searchPanes_options
                            ? http.searchPanes_options.cascade === 'true'
                            : false;
                        entries = null;
                        value = this._value
                            ? this._value
                            : field.dbField();
                        table = editor.table()[0];
                        readTable = editor.readTable();
                        if (this._table) {
                            table = this._table;
                        }
                        else if (readTable.length) {
                            table = readTable[0];
                        }
                        label = this._label
                            ? this._label
                            : value;
                        formatter = this._renderer
                            ? this._renderer
                            : function (d) { return d; };
                        join = this._leftJoin.slice();
                        if (leftJoinIn) {
                            for (i = 0; i < leftJoinIn.length; i++) {
                                found = false;
                                for (j = 0; j < join.length; j++) {
                                    if (join[j].table === leftJoinIn[i].table) {
                                        found = true;
                                    }
                                }
                                if (!found) {
                                    join.push(leftJoinIn[i]);
                                }
                            }
                        }
                        q = db
                            .distinct()
                            .select(label + ' as label', value + ' as value')
                            .from(table)
                            .groupBy(value);
                        if (this._where) {
                            q.where(this._where);
                        }
                        // If not cascading, then the total and count must be the same
                        if (viewTotal) {
                            q.count({ total: '*' });
                        }
                        (0, helpers_1.leftJoin)(q, join);
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
                        return [4 /*yield*/, q];
                    case 1:
                        rows = _a.sent();
                        // Remove any filtering entries that don't exist in the database (values might have changed)
                        if (http.searchPanes && http.searchPanes[field.name()]) {
                            values = rows.map(function (r) { return r.value; });
                            selected = http.searchPanes[field.name()];
                            for (i = selected.length - 1; i >= 0; i--) {
                                if (!values.includes(selected[i])) {
                                    http.searchPanes[field.name()].splice(i, 1);
                                }
                            }
                        }
                        if (!(viewCount || cascade)) return [3 /*break*/, 3];
                        query = db.table(table);
                        (0, helpers_1.leftJoin)(query, join);
                        if (field.apply('get') && !field.getValue()) {
                            query
                                .distinct()
                                .select(value + ' as value')
                                .groupBy(value);
                            // We viewTotal is enabled, we need to do a count to get the number of records,
                            // If it isn't we still need to know it exists, but don't care about the cardinality
                            if (viewCount) {
                                query.count({ count: '*' });
                            }
                            else {
                                query.select('(1) as count');
                            }
                        }
                        _loop_1 = function (fie) {
                            var add = false;
                            var fieName = fie.name();
                            // If there is a last value set then a slightly different set of results is required for cascade
                            // That panes results are based off of the results when only considering the selections of all of the others
                            if (http.searchPanesLast && field.name() === http.searchPanesLast) {
                                if (http.searchPanes[fieName] !== undefined && fieName !== http.searchPanesLast) {
                                    add = true;
                                }
                            }
                            else if (http.searchPanes && http.searchPanes[fieName] !== undefined) {
                                add = true;
                            }
                            if (add) {
                                query.where(function () {
                                    for (var i = 0; i < http.searchPanes[fieName].length; i++) {
                                        if (http.searchPanes_null !== undefined && http.searchPanes_null[fieName][i]) {
                                            this.orWhereNull(fieName);
                                        }
                                        else {
                                            this.orWhere(fieName, http.searchPanes[fieName][i]);
                                        }
                                    }
                                });
                            }
                        };
                        // Construct the where queries based upon the options selected by the user
                        for (_i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                            fie = fields_1[_i];
                            _loop_1(fie);
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        entriesRows = _a.sent();
                        // Key by value for fast lookup
                        entries = {};
                        entriesRows.forEach(function (r) {
                            entries[r.value] = r;
                        });
                        _a.label = 3;
                    case 3:
                        out = [];
                        for (i = 0; i < rows.length; i++) {
                            row = rows[i];
                            value_1 = row.value;
                            total = row.total !== undefined ? row.total : null;
                            count = total;
                            if (entries) {
                                count = entries[value_1] && entries[value_1].count
                                    ? entries[value_1].count
                                    : 0;
                                // For when viewCount is enabled and viewTotal is not
                                // the total needs to be the same as the count!
                                if (total === null) {
                                    total = count;
                                }
                            }
                            out.push({
                                label: formatter(row.label),
                                total: total,
                                value: value_1,
                                count: count
                            });
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
    return SearchPaneOptions;
}());
exports.default = SearchPaneOptions;

//# sourceMappingURL=searchPaneOptions.js.map
