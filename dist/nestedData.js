"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NestedData = (function () {
    function NestedData() {
    }
    NestedData.prototype._propExists = function (name, data) {
        if (name.indexOf('.') === -1) {
            return data[name] === undefined ?
                false :
                true;
        }
        var names = name.split('.');
        var inner = data;
        for (var i = 0, ien = names.length - 1; i < ien; i++) {
            if (inner[names[i]] === undefined) {
                return false;
            }
            inner = inner[names[i]];
        }
        return inner[names[names.length - 1]] === undefined ?
            false :
            true;
    };
    NestedData.prototype._readProp = function (name, data) {
        if (name.indexOf('.') === -1) {
            return data[name] !== undefined ?
                data[name] :
                null;
        }
        var names = name.split('.');
        var inner = data;
        for (var i = 0, ien = names.length - 1; i < ien; i++) {
            if (inner[names[i]] === undefined) {
                return false;
            }
            inner = inner[names[i]];
        }
        var idx = names[names.length - 1];
        return inner[idx] !== undefined ?
            inner[idx] :
            null;
    };
    NestedData.prototype._writeProp = function (out, name, value) {
        if (name.indexOf('.') === -1) {
            out[name] = value;
            return;
        }
        var names = name.split('.');
        var inner = out;
        for (var i = 0, ien = names.length - 1; i < ien; i++) {
            var loopName = names[i];
            if (inner[loopName] === undefined) {
                inner[loopName] = {};
            }
            else if (typeof inner[loopName] !== 'object') {
                throw new Error('A property with the name `' + name + '` already exists. ' +
                    'This can occur if you have properties which share a prefix - ' +
                    'for example `name` and `name.first`.');
            }
            inner = inner[loopName];
        }
        var idx = names[names.length - 1];
        if (inner[idx] !== undefined) {
            throw new Error('Duplicate field deletected - a field with the name ' +
                '`' + name + '` already exists');
        }
        inner[idx] = value;
    };
    return NestedData;
}());
exports.default = NestedData;

//# sourceMappingURL=nestedData.js.map
