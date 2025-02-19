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
var Options = /** @class */ (function () {
    function Options(table, value, label) {
        this._alwaysRefresh = true;
        this._includes = [];
        this._searchOnly = false;
        this._leftJoin = [];
        this._order = true;
        this._manualOpts = [];
        if (typeof table === 'string') {
            this.table(table);
            this.value(value);
            this.label(label);
        }
        else if (typeof table === 'function') {
            this.fn(table);
        }
    }
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Public methods
     */
    /**
     * Add extra options to the list, in addition to any obtained from the database
     *
     * @param label Label
     * @param value Value
     */
    Options.prototype.add = function (label, value) {
        if (value === undefined) {
            value = label;
        }
        this._manualOpts.push({
            label: label,
            value: value
        });
        return this;
    };
    Options.prototype.alwaysRefresh = function (set) {
        if (set === undefined) {
            return this._alwaysRefresh;
        }
        this._alwaysRefresh = set;
        return this;
    };
    Options.prototype.fn = function (set) {
        if (set === undefined) {
            return this._customFn;
        }
        this._customFn = set;
        return this;
    };
    Options.prototype.include = function (set) {
        if (set === undefined) {
            return this._includes;
        }
        if (Array.isArray(set)) {
            this._includes.push.apply(this._includes, set);
        }
        else {
            this._includes.push(set);
        }
        return this;
    };
    Options.prototype.label = function (label) {
        if (label === undefined) {
            return this._label;
        }
        if (Array.isArray(label)) {
            this._label = label;
        }
        else {
            this._label = [label];
        }
        return this;
    };
    Options.prototype.leftJoin = function (table, field1, operator, field2) {
        if (operator === void 0) { operator = undefined; }
        if (field2 === void 0) { field2 = undefined; }
        if (typeof field1 === 'function') {
            this._leftJoin.push({
                field1: '',
                field2: '',
                fn: field1,
                operator: '',
                table: table
            });
        }
        else {
            this._leftJoin.push({
                field1: field1,
                field2: field2,
                operator: operator,
                table: table
            });
        }
        return this;
    };
    Options.prototype.limit = function (limit) {
        if (limit === undefined) {
            return this._limit;
        }
        this._limit = limit;
        return this;
    };
    Options.prototype.order = function (order) {
        if (order === undefined) {
            return this._order;
        }
        this._order = order;
        return this;
    };
    Options.prototype.render = function (fn) {
        if (fn === undefined) {
            return this._renderer;
        }
        this._renderer = fn;
        return this;
    };
    Options.prototype.searchOnly = function (set) {
        if (set === undefined) {
            return this._searchOnly;
        }
        this._searchOnly = set;
        return this;
    };
    Options.prototype.table = function (table) {
        if (table === undefined) {
            return this._table;
        }
        this._table = table;
        return this;
    };
    Options.prototype.value = function (value) {
        if (value === undefined) {
            return this._value;
        }
        this._value = value;
        return this;
    };
    Options.prototype.where = function (where) {
        if (where === undefined) {
            return this._where;
        }
        this._where = where;
        return this;
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Internal methods
     */
    /**
     * @ignore
     */
    Options.prototype.exec = function (db, refresh, search, find) {
        if (search === void 0) { search = null; }
        if (find === void 0) { find = null; }
        return __awaiter(this, void 0, void 0, function () {
            var label, value, formatter, out, max, options, i, i, ien, rowLabel, rowValue, option, j, inc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If search only, and not a search action, then just return false
                        if (this.searchOnly() && search === null && find === null) {
                            return [2 /*return*/, false];
                        }
                        // Only get the options if doing a full load, or always is set
                        if (refresh === true && !this.alwaysRefresh()) {
                            return [2 /*return*/, false];
                        }
                        if (this._customFn) {
                            return [2 /*return*/, this._customFn(db, search)];
                        }
                        label = this._label;
                        value = this._value;
                        formatter = this._renderer;
                        out = [];
                        max = this._limit;
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
                        return [4 /*yield*/, this.execDb(db, find)];
                    case 1:
                        options = _a.sent();
                        // Manually added options
                        for (i = 0; i < this._manualOpts.length; i++) {
                            options.push(this._manualOpts[i]);
                        }
                        // Create the output array
                        for (i = 0, ien = options.length; i < ien; i++) {
                            rowLabel = formatter(options[i]);
                            rowValue = options[i][value];
                            // Apply the search to the rendered label. Need to do it here rather than in SQL since
                            // the label is rendered in script.
                            if (search === null ||
                                search === '' ||
                                rowLabel.toLowerCase().indexOf(search.toLowerCase()) === 0) {
                                option = {
                                    label: rowLabel,
                                    value: rowValue
                                };
                                // Add in any columns that are needed for extra data (includes)
                                for (j = 0; j < this._includes.length; j++) {
                                    inc = this._includes[j];
                                    if (options[i][inc] !== undefined) {
                                        option[inc] = options[i][inc];
                                    }
                                }
                                out.push(option);
                            }
                            // Limit needs to be done in script space, rather than SQL, to allow for the script
                            // based filtering above, and also for when using a custom function
                            if (max !== null && out.length >= max) {
                                break;
                            }
                        }
                        // Local sorting
                        if (this._order === true) {
                            out.sort(function (a, b) {
                                var aLabel = a.label;
                                var bLabel = b.label;
                                if (aLabel === null) {
                                    aLabel = '';
                                }
                                if (bLabel === null) {
                                    bLabel = '';
                                }
                                if (isNumeric(aLabel) && isNumeric(bLabel)) {
                                    return aLabel * 1 - bLabel * 1;
                                }
                                return aLabel < bLabel ? -1 : aLabel > bLabel ? 1 : 0;
                            });
                        }
                        return [2 /*return*/, out];
                }
            });
        });
    };
    /**
     * Get the list of options from the database based on the configuration
     *
     * @param db Database connection
     * @param find Values to search for
     * @returns List of found options
     */
    Options.prototype.execDb = function (db, find) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, q, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._table) {
                            return [2 /*return*/, []];
                        }
                        fields = [].concat(this._label);
                        if (!fields.includes(this._value)) {
                            fields.push(this._value);
                        }
                        q = db
                            .select(fields)
                            .distinct()
                            .from(this._table);
                        if (this._where) {
                            q.where(this._where);
                        }
                        if (Array.isArray(find)) {
                            q.whereIn(this._value, find);
                        }
                        if (typeof this._order === 'string') {
                            // For cases where we are ordering by a field which isn't included in the list
                            // of fields to display, we need to add the ordering field, due to the
                            // select distinct.
                            this._order.split(',').forEach(function (val) {
                                val = val.toLocaleLowerCase();
                                var direction = val.match(/( desc| asc)/g);
                                var field = val.replace(/( desc| asc$)/, '').trim();
                                if (!fields.includes(field)) {
                                    q.select(field);
                                }
                                q.orderBy(field, direction ? direction[0].trim() : 'asc');
                            });
                        }
                        else if (this._order === true) {
                            // Attempt to do a database order, needed for `limit()`ed results
                            q.orderBy(this._label[0], 'asc');
                        }
                        (0, helpers_1.leftJoin)(q, this._leftJoin);
                        return [4 /*yield*/, q];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    /**
     * Get the objects for a set of values.
     *
     * @param db  Database connection
     * @param ids IDs to get
     *
     * @return array|bool List of options
     */
    Options.prototype.find = function (db, ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.exec(db, false, null, ids)];
            });
        });
    };
    /**
     * Do a search for data on the source.
     *
     * @param db   Database connection
     * @param term Search term
     *
     * @return array|bool List of options
     */
    Options.prototype.search = function (db, term) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.exec(db, false, term)];
            });
        });
    };
    return Options;
}());
exports.default = Options;

//# sourceMappingURL=options.js.map
