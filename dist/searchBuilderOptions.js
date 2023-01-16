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
var SearchBuilderOptions = /** @class */ (function () {
    function SearchBuilderOptions() {
        this._leftJoin = [];
    }
    SearchBuilderOptions.prototype.label = function (label) {
        if (label === undefined) {
            return this._label;
        }
        this._label = Array.isArray(label) ?
            label :
            [label];
        return this;
    };
    SearchBuilderOptions.prototype.order = function (order) {
        if (order === undefined) {
            return this._order;
        }
        this._order = order;
        return this;
    };
    SearchBuilderOptions.prototype.render = function (fn) {
        if (fn === undefined) {
            return this._renderer;
        }
        this._renderer = fn;
        return this;
    };
    SearchBuilderOptions.prototype.table = function (table) {
        if (table === undefined) {
            return this._table;
        }
        this._table = table;
        return this;
    };
    SearchBuilderOptions.prototype.value = function (value) {
        if (value === undefined) {
            return this._value;
        }
        this._value = value;
        return this;
    };
    SearchBuilderOptions.prototype.where = function (where) {
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
    SearchBuilderOptions.prototype.leftJoin = function (table, field1, operator, field2) {
        if (this._leftJoin === undefined || this._leftJoin === null) {
            this._leftJoin = [];
        }
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
     * Execution function for getting the SearchBuilder options
     * @param field The field to retrieve data from
     * @param editor The editor instance
     * @param http The http sent to the server
     * @param fieldsIn All of the fields
     * @param leftJoinIn Info for a leftJoin if required
     */
    SearchBuilderOptions.prototype.exec = function (field, editor, http, fieldsIn, leftJoinIn) {
        return __awaiter(this, void 0, void 0, function () {
            var label, value, table, formatter, join, fields, sbopts, db, query, res, out, _i, res_1, recordCou;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        formatter = this._renderer;
                        join = this._leftJoin;
                        fields = fieldsIn;
                        // First get a value for `value`. This can be retrieved from either the
                        //  SearchBuilderOptions or the fieldName if it has not been declared
                        if (this._value === undefined) {
                            sbopts = field.searchBuilderOptions();
                            value = sbopts.label() !== undefined ?
                                sbopts.label()[0] :
                                value = field.name();
                        }
                        // Otherwise we can just get it from the value that has been defined
                        else {
                            value = this._value;
                        }
                        // If label is undefined then just assume the same value as `value`
                        if (this._label === undefined) {
                            label = value;
                        }
                        // Otherwise work it out from what has been defined
                        else {
                            label = this._label;
                        }
                        // If the table has not been defined then get it from the editor instance
                        table = this._table !== undefined ?
                            this._table :
                            editor.readTable().length > 0 ?
                                editor.readTable()[0] :
                                editor.table()[0];
                        if (leftJoinIn !== undefined && leftJoinIn !== null && this._leftJoin === undefined) {
                            join = leftJoinIn;
                        }
                        db = editor.db();
                        // Create a list of the fields that we need to get from the db
                        // let fields = [ value ].concat(label);
                        // We need a default formatter if one isn't provided
                        if (!formatter) {
                            formatter = function (str) {
                                return str;
                            };
                        }
                        query = db
                            .select(label + ' as label', value + ' as value')
                            .from(table)
                            .distinct()
                            .groupBy(value);
                        (0, helpers_1.leftJoin)(query, join);
                        return [4 /*yield*/, query];
                    case 1:
                        res = _a.sent();
                        out = [];
                        // Create the output array and add the values of count, label, total and value for each unique entry
                        for (_i = 0, res_1 = res; _i < res_1.length; _i++) {
                            recordCou = res_1[_i];
                            out.push({
                                value: recordCou.value,
                                label: recordCou.label,
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
    return SearchBuilderOptions;
}());
exports.default = SearchBuilderOptions;

//# sourceMappingURL=searchBuilderOptions.js.map
