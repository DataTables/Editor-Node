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
var Options = /** @class */ (function () {
    function Options() {
        this._manualOpts = [];
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
    Options.prototype.exec = function (db) {
        return __awaiter(this, void 0, void 0, function () {
            var label, value, formatter, fields, q, res, out, i, ien;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        label = this._label;
                        value = this._value;
                        formatter = this._renderer;
                        fields = [value].concat(label);
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
                        q = db
                            .select()
                            .from(this._table)
                            .distinct(fields);
                        if (this._where) {
                            q.where(this._where);
                        }
                        if (this._order) {
                            // For cases where we are ordering by a field which isn't included in the list
                            // of fields to display, we need to add the ordering field, due to the
                            // select distinct.
                            this._order.split(',').forEach(function (val) {
                                var field = val.toLocaleLowerCase()
                                    .replace(' asc', '')
                                    .replace('desc', '')
                                    .trim();
                                if (!fields.includes(field)) {
                                    q.select(field);
                                }
                            });
                            q.orderBy(this._order);
                        }
                        if (this._limit) {
                            q.limit(this.limit());
                        }
                        return [4 /*yield*/, q];
                    case 1:
                        res = _a.sent();
                        out = [];
                        // Create the output array
                        for (i = 0, ien = res.length; i < ien; i++) {
                            out.push({
                                label: formatter(res[i]),
                                value: res[i][value]
                            });
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
    return Options;
}());
exports.default = Options;

//# sourceMappingURL=options.js.map
