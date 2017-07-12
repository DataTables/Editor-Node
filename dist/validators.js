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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var options_1 = require("./options");
var validUrl = require("valid-url");
var moment = require("moment");
var Options = (function () {
    function Options() {
        this.message = "Input not valid";
        this.empty = true;
        this.optional = true;
    }
    // internal
    Options.select = function (user) {
        if (user) {
            return user;
        }
        return new Options();
    };
    return Options;
}());
exports.Options = Options;
var Host = (function () {
    function Host(opts) {
        this.action = opts.action;
        this.id = opts.id;
        this.field = opts.field;
        this.editor = opts.editor;
        this.db = opts.db;
    }
    return Host;
}());
exports.Host = Host;
var Validator = (function () {
    function Validator() {
    }
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
    Validator.basic = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.required = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.notEmpty = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.boolean = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
                    if (val === true || val === 1 || val === '1' || val === 'true' || val === 't' || val === 'on' || val === 'yes' ||
                        val === false || val === 0 || val === '0' || val === 'false' || val === 'f' || val === 'off' || val === 'no') {
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
    Validator.numeric = function (decimal, cfg) {
        if (decimal === void 0) { decimal = '.'; }
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.minNum = function (min, decimal, cfg) {
        if (decimal === void 0) { decimal = '.'; }
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.maxNum = function (max, decimal, cfg) {
        if (decimal === void 0) { decimal = '.'; }
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.minMaxNum = function (min, max, decimal, cfg) {
        if (decimal === void 0) { decimal = '.'; }
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
     * Number validation methods
     */
    Validator.email = function (decimal, cfg) {
        if (decimal === void 0) { decimal = '.'; }
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.minLen = function (min, cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.maxLen = function (max, cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.minMaxLen = function (min, max, cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.ip = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.url = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
                    return [2 /*return*/, !validUrl.isHttpUri(val) ?
                            opts.message :
                            true];
                });
            });
        };
    };
    Validator.xss = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.values = function (values, cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.noTags = function (cfg) {
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.dateFormat = function (format, locale, cfg) {
        if (locale === void 0) { locale = null; }
        if (cfg === void 0) { cfg = null; }
        var opts = Options.select(cfg);
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
    Validator.dbUnique = function (cfg, column, table, db) {
        if (cfg === void 0) { cfg = null; }
        if (column === void 0) { column = null; }
        if (table === void 0) { table = null; }
        if (db === void 0) { db = null; }
        var opts = Options.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common, q, cond, res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
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
                            q = host.db()(table)
                                .select(column)
                                .where({ column: val });
                            // If doing an edit then we need to also discount the current row,
                            // since it is of course already validly unique
                            if (host.action === 'edit') {
                                cond = host.editor.pkeyToObject(host.id, true);
                                q.whereNot(cond);
                            }
                            return [4 /*yield*/, q];
                        case 1:
                            res = _a.sent();
                            return [2 /*return*/, !res ?
                                    opts.message :
                                    true];
                    }
                });
            });
        };
    };
    Validator.dbValues = function (cfg, column, table, db) {
        if (cfg === void 0) { cfg = null; }
        if (column === void 0) { column = null; }
        if (table === void 0) { table = null; }
        if (db === void 0) { db = null; }
        var opts = Options.select(cfg);
        return function (val, data, host) {
            return __awaiter(this, void 0, void 0, function () {
                var common, options, res, _a;
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
                                throw new Error('Table or column for database value check is not defined for field ' + host.field.name());
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
    Validator.fileExtensions = function (extns, msg) {
        return function (file) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, extns.includes(file.extn) ?
                            true :
                            msg];
                });
            });
        };
    };
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
    return Validator;
}());
Validator.Options = Options;
Validator.Host = Host;
exports.default = Validator;

//# sourceMappingURL=validators.js.map
