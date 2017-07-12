"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var Formatter = (function () {
    function Formatter() {
    }
    Formatter.sqlDateToFormat = function (format) {
        return function (val, data) {
            return moment(val, 'YYYY-MM-DD').format(format);
        };
    };
    Formatter.formatToSqlDate = function (format) {
        return function (val, data) {
            return moment(val, format).format('YYYY-MM-DD');
        };
    };
    Formatter.dateTime = function (from, to) {
        return function (val, data) {
            return moment(val, from).format(to);
        };
    };
    Formatter.explode = function (delimiter) {
        if (delimiter === void 0) { delimiter = '|'; }
        return function (val, data) {
            return val.toString().split(delimiter);
        };
    };
    Formatter.implode = function (delimiter) {
        if (delimiter === void 0) { delimiter = '|'; }
        return function (val, data) {
            return val.join(delimiter);
        };
    };
    Formatter.ifEmpty = function (emptyValue) {
        return function (val, data) {
            return val === '' ?
                emptyValue :
                val;
        };
    };
    Formatter.fromDecimalChar = function (char) {
        if (char === void 0) { char = ','; }
        return function (val, data) {
            return val.replace(char, '.');
        };
    };
    Formatter.toDecimalChar = function (char) {
        if (char === void 0) { char = ','; }
        return function (val, data) {
            return val.replace('.', char);
        };
    };
    return Formatter;
}());
exports.default = Formatter;

//# sourceMappingURL=formatters.js.map
