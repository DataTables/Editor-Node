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
var moment = require("moment");
var validUrl = require("valid-url");
var options_1 = require("./options");
var validationHost_1 = require("./validationHost");
var validationOptions_1 = require("./validationOptions");
/**
 * Validation methods for DataTables Editor fields. All of the methods
 * defined in this class return a function that can be used by
 * {@link Field} instance's {@link Field.Validator} method.
 *
 * Each method may define its own parameters that configure how the
 * formatter operates. For example the `minLen` validator takes information
 * on the minimum length of value to accept.
 *
 * Additionally each method can optionally take a `ValidationOptions`
 * instance that controls common validation options and error messages.
 *
 * The validation functions return `true` for valid data and a string for
 * invalid data, with the string being the error message.
 *
 * @export
 * @class Validator
 */
var Validator = /** @class */ (function () {
    function Validator() {
    }
    /**
     * No validation - all inputs are valid
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.none = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, true];
                });
            });
        };
    };
    /**
     * Basic validation - this is used to perform the validation provided by the
     * validation options only. If the validation options pass (e.g. `required`,
     * `empty` and `optional`) then the validation will pass regardless of the
     * actual value.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.basic = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    return [2 /*return*/, common === false ?
                            opts.message :
                            true];
                });
            });
        };
    };
    /**
     * Required field - there must be a value and it must be a non-empty value
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.required = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        opts.empty = false;
        opts.optional = false;
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    return [2 /*return*/, common === false ?
                            opts.message :
                            true];
                });
            });
        };
    };
    /**
     * Optional field, but if given there must be a non-empty value
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.notEmpty = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        opts.empty = false;
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    return [2 /*return*/, common === false ?
                            opts.message :
                            true];
                });
            });
        };
    };
    /**
     * Validate an input as a boolean value.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.boolean = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    if (val === true || val === 1 || val === '1' || val === 'true' || val === 't' ||
                        val === 'on' || val === 'yes' || val === false || val === 0 || val === '0' ||
                        val === 'false' || val === 'f' || val === 'off' || val === 'no') {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, opts.message];
                });
            });
        };
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Number validation methods
     */
    /**
     * Check that any input is numeric.
     *
     * @static
     * @param {string} [decimal='.'] Character to use as the decimal place
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.numeric = function (decimal, cfg) {
        if (decimal === void 0) { decimal = '.'; }
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    if (decimal !== '.') {
                        val = val.toString().replace(decimal, '.');
                    }
                    return [2 /*return*/, isNaN(parseFloat(val)) ?
                            opts.message :
                            true];
                });
            });
        };
    };
    /**
     * Check for a numeric input and that it is greater than a given value.
     *
     * @static
     * @param {number} min Minimum value
     * @param {string} [decimal='.'] Character to use as the decimal place
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.minNum = function (min, decimal, cfg) {
        if (decimal === void 0) { decimal = '.'; }
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var numeric;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Validator.numeric(decimal, opts)(val, data, host)];
                        case 1:
                            numeric = _a.sent();
                            if (numeric !== true) {
                                return [2 /*return*/, opts.message];
                            }
                            if (decimal !== '.') {
                                val = val.toString().replace(decimal, '.');
                            }
                            return [2 /*return*/, val < min ?
                                    opts.message :
                                    true];
                    }
                });
            });
        };
    };
    /**
     * Check for a numeric input and that it is less than a given value.
     *
     * @static
     * @param {number} max Maximum value
     * @param {string} [decimal='.'] Character to use as the decimal place
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.maxNum = function (max, decimal, cfg) {
        if (decimal === void 0) { decimal = '.'; }
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var numeric;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Validator.numeric(decimal, opts)(val, data, host)];
                        case 1:
                            numeric = _a.sent();
                            if (numeric !== true) {
                                return [2 /*return*/, opts.message];
                            }
                            if (decimal !== '.') {
                                val = val.toString().replace(decimal, '.');
                            }
                            return [2 /*return*/, val > max ?
                                    opts.message :
                                    true];
                    }
                });
            });
        };
    };
    /**
     * Check for a numeric input and that it is in between two given values.
     *
     * @static
     * @param {number} min Minimum value
     * @param {number} max Maximum value
     * @param {string} [decimal='.'] Character to use as the decimal place
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.minMaxNum = function (min, max, decimal, cfg) {
        if (decimal === void 0) { decimal = '.'; }
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var numeric;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Validator.numeric(decimal, opts)(val, data, host)];
                        case 1:
                            numeric = _a.sent();
                            if (numeric !== true) {
                                return [2 /*return*/, opts.message];
                            }
                            if (decimal !== '.') {
                                val = val.toString().replace(decimal, '.');
                            }
                            return [2 /*return*/, val < min || val > max ?
                                    opts.message :
                                    true];
                    }
                });
            });
        };
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * String validation methods
     */
    /**
     * Validate an input as an e-mail address.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.email = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common, re;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                    return [2 /*return*/, re.test(val) ?
                            true :
                            opts.message];
                });
            });
        };
    };
    /**
     * Validate a string has a minimum length.
     *
     * @static
     * @param {number} min Minimum length
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.minLen = function (min, cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    return [2 /*return*/, val.length < min ?
                            opts.message :
                            true];
                });
            });
        };
    };
    /**
     * Validate a string is less or equal to a maximum length.
     *
     * @static
     * @param {number} max Maximum length
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.maxLen = function (max, cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    return [2 /*return*/, val.length > max ?
                            opts.message :
                            true];
                });
            });
        };
    };
    /**
     * Require a string with a certain minimum or maximum number of characters.
     *
     * @static
     * @param {number} min Minimum length
     * @param {number} max Maximum length
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.minMaxLen = function (min, max, cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    return [2 /*return*/, val.length < min || val.length > max ?
                            opts.message :
                            true];
                });
            });
        };
    };
    /**
     * Validate as an IP address.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.ip = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common, a, i, parsed;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    a = val.split('.');
                    if (a.length !== 4) {
                        return [2 /*return*/, opts.message];
                    }
                    for (i = 0; i < 4; i++) {
                        parsed = parseInt(a[i], 10);
                        if (parsed !== a[i] * 1) {
                            return [2 /*return*/, opts.message];
                        }
                        if (parsed < 0 || parsed > 255) {
                            return [2 /*return*/, opts.message];
                        }
                    }
                    return [2 /*return*/, true];
                });
            });
        };
    };
    /**
     * Validate as a URL.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.url = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    return [2 /*return*/, !validUrl.isHttpUri(val, true) ?
                            opts.message :
                            true];
                });
            });
        };
    };
    /**
     * Check if string could contain an XSS attack string
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.xss = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common, field;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    field = host.field;
                    return [2 /*return*/, field.xssSafety(val) !== val ?
                            opts.message :
                            true];
                });
            });
        };
    };
    /**
     * Confirm that the value submitted is in a list of allowable values
     *
     * @static
     * @param {any[]} values List of values that are valid
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.values = function (values, cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    return [2 /*return*/, values.includes(val) ?
                            true :
                            opts.message];
                });
            });
        };
    };
    /**
     * Ensure that the submitted string does not contain HTML tags
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.noTags = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    return [2 /*return*/, val.toString().test(/<.*>/) ?
                            opts.message :
                            true];
                });
            });
        };
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Date validation methods
    */
    /**
     * Check that a valid date input is given. Uses MomentJS
     *
     * @static
     * @param {string} format MomentJS date format
     * @param {string} [locale=null] MomentJS locale
     * @param {ValidationOptions} [cfg=null] Validation options
     * @returns {IValidator} Configured validation function
     */
    Validator.dateFormat = function (format, locale, cfg) {
        if (locale === void 0) { locale = null; }
        if (cfg === void 0) { cfg = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common, res;
                return __generator(this, function (_a) {
                    common = Validator._common(val, opts);
                    if (common !== null) {
                        return [2 /*return*/, common === false ?
                                opts.message :
                                true];
                    }
                    res = locale ?
                        moment(val, format, locale, true).isValid() :
                        moment(val, format, true).isValid();
                    return [2 /*return*/, !res ?
                            opts.message :
                            true];
                });
            });
        };
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Database validation
    */
    /**
     * Check that the given value is unique in the database
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @param {string} [column=null] Column name to use to check as a unique
     *   value. If not given the host field's database column name is used
     * @param {string} [table=null] Table to check that this value is uniquely
     *   valid on. If not given the host Editor's table name is used
     * @param {knex} [db=null] Database connection. If not given the host
     *   Editor's database connection is used
     * @returns {IValidator} Configured validation function
     */
    Validator.dbUnique = function (cfg, column, table, db) {
        if (cfg === void 0) { cfg = null; }
        if (column === void 0) { column = null; }
        if (table === void 0) { table = null; }
        if (db === void 0) { db = null; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common, q, cond, res;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            common = Validator._common(val, opts);
                            if (common !== null) {
                                return [2 /*return*/, common === false ?
                                        opts.message :
                                        true];
                            }
                            if (db === null) {
                                db = host.db;
                            }
                            if (table === null) {
                                table = host.editor.table()[0];
                            }
                            if (column === null) {
                                column = host.field.dbField();
                            }
                            q = db(table)
                                .select(column)
                                .where((_a = {}, _a[column] = val, _a));
                            // If doing an edit then we need to also discount the current row,
                            // since it is of course already validly unique
                            if (host.action === 'edit') {
                                cond = host.editor.pkeyToObject(host.id, true);
                                q.whereNot(cond);
                            }
                            return [4 /*yield*/, q];
                        case 1:
                            res = _b.sent();
                            return [2 /*return*/, res.length ?
                                    opts.message :
                                    true];
                    }
                });
            });
        };
    };
    /**
     * Check that the given value is a value that is available in a database -
     * i.e. a join primary key. This will attempt to automatically use the table
     * name and value column from the field's `Options` method (under the
     * assumption that it will typically be used with a joined field), but the
     * table and field can also be specified via the options.
     *
     * @static
     * @param {ValidationOptions} [cfg=null] Validation options
     * @param {string} [column=null] Column name to use to check as a unique
     *   value. If not given the host field's database column name is used
     * @param {string} [table=null] Table to check that this value is uniquely
     *   valid on. If not given the host Editor's table name is used
     * @param {knex} [db=null] Database connection. If not given the host
     *   Editor's database connection is used
     * @returns {IValidator} Configured validation function
     */
    Validator.dbValues = function (cfg, column, table, db, values) {
        if (cfg === void 0) { cfg = null; }
        if (column === void 0) { column = null; }
        if (table === void 0) { table = null; }
        if (db === void 0) { db = null; }
        if (values === void 0) { values = []; }
        var opts = validationOptions_1.default.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common, options, res;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            common = Validator._common(val, opts);
                            options = host.field.options();
                            if (common !== null) {
                                return [2 /*return*/, common === false ?
                                        opts.message :
                                        true];
                            }
                            if (values.indexOf(val) !== -1) {
                                return [2 /*return*/, true];
                            }
                            if (db === null) {
                                db = host.db;
                            }
                            if (table === null && options instanceof options_1.default) {
                                table = options.table();
                            }
                            if (column === null && options instanceof options_1.default) {
                                column = options.value();
                            }
                            if (table === null || column === null) {
                                throw new Error('Table or column for database value check is not ' +
                                    'defined for field ' + host.field.name());
                            }
                            return [4 /*yield*/, db(table)
                                    .select(column)
                                    .where((_a = {}, _a[column] = val, _a))];
                        case 1:
                            res = _b.sent();
                            return [2 /*return*/, !res ?
                                    opts.message :
                                    true];
                    }
                });
            });
        };
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * File upload validators
    */
    /**
     * Check that the uploaded file has a given extension
     *
     * @static
     * @param {string[]} extns Allowed extensions
     * @param {string} msg Error message to return if not valid
     * @returns {IValidator} Configured validation function
     */
    Validator.fileExtensions = function (extns, msg) {
        return function (file) {
            return __awaiter(this, void 0, void 0, function () {
                var i, ien;
                return __generator(this, function (_a) {
                    for (i = 0, ien = extns.length; i < ien; i++) {
                        if (file.extn.toLowerCase() === extns[i].toLowerCase()) {
                            return [2 /*return*/, true];
                        }
                    }
                    return [2 /*return*/, msg];
                });
            });
        };
    };
    /**
     * Check that the uploaded file is equal or less than a given size.
     *
     * @static
     * @param {string[]} size Max file size in bytes
     * @returns {IValidator} Configured validation function
     */
    Validator.fileSize = function (size, msg) {
        return function (file) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, file.size > size ?
                            msg :
                            true];
                });
            });
        };
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Mjoin validators
    */
    /**
     * Require a minimum value of the number of options / values submitted in
     * an array
     *
     * @static
     * @param size Min array size required to be valid
     * @param msg Error message
     * @returns {IValidator} Configured validation function
     */
    Validator.mjoinMinCount = function (size, msg) {
        return function (editor, action, data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (action === 'create' || action === 'edit') {
                        return [2 /*return*/, data.length < size ?
                                msg :
                                true];
                    }
                    return [2 /*return*/, true];
                });
            });
        };
    };
    /**
     * Require a maximum value of the number of options / values submitted in
     * an array
     *
     * @static
     * @param size Max array size required to be valid
     * @param msg Error message
     * @returns {IValidator} Configured validation function
     */
    Validator.mjoinMaxCount = function (size, msg) {
        return function (editor, action, data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (action === 'create' || action === 'edit') {
                        return [2 /*return*/, data.length > size ?
                                msg :
                                true];
                    }
                    return [2 /*return*/, true];
                });
            });
        };
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Internal methods
    */
    Validator._common = function (val, opts) {
        // Error state tests
        if (!opts.optional && val === null) {
            // Value must be given
            return false;
        }
        if (val !== null && opts.empty === false && val === '') {
            // Value must not be empty
            return false;
        }
        // Validate passed states
        if (opts.optional && val === null) {
            return true;
        }
        if (opts.empty === true && val === '') {
            return true;
        }
        // Have the specific validation function perform its tests
        return null;
    };
    Validator.Options = validationOptions_1.default;
    Validator.Host = validationHost_1.default;
    return Validator;
}());
exports.default = Validator;

//# sourceMappingURL=validators.js.map
