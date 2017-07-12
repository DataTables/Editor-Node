"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xssFilters = require("xss-filters");
function xss(str) {
    return xssFilters.inHTMLData(str);
}
exports.default = xss;

//# sourceMappingURL=xss.js.map
