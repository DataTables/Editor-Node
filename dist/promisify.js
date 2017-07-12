"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promisify(fn, scope) {
    if (scope === void 0) { scope = null; }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            // Assume the callback handler goes at the end of the arguments
            args.push(function (err, val) {
                // Assume that err is the first argument and value is the second
                if (err) {
                    reject(err);
                }
                else {
                    resolve(val);
                }
            });
            fn.apply(scope || fn, args);
        });
    };
}
exports.default = promisify;
;

//# sourceMappingURL=promisify.js.map
