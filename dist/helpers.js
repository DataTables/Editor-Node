"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leftJoin = void 0;
function leftJoin(query, leftJoin) {
    if (leftJoin === null || leftJoin === undefined) {
        return;
    }
    var _loop_1 = function (i, ien) {
        var join = leftJoin[i];
        if (join.fn) {
            query.leftJoin(join.table, join.fn);
        }
        else {
            query.leftJoin(join.table, function () {
                this.on(join.field1, join.operator, join.field2);
            });
        }
    };
    for (var i = 0, ien = leftJoin.length; i < ien; i++) {
        _loop_1(i, ien);
    }
}
exports.leftJoin = leftJoin;

//# sourceMappingURL=helpers.js.map
