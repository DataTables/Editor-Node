"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xssFilters = require("xss-filters");
/**
 * Editor's default XSS protection method
 *
 * @export
 * @param {string} str User submitted string
 * @returns {string} Sanitized string
 */
function xss(str) {
    return xssFilters.inHTMLData(str);
}
exports.default = xss;

//# sourceMappingURL=xss.js.map
