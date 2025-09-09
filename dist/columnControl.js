"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ColumnControl = /** @class */ (function () {
    function ColumnControl() {
    }
    ColumnControl.ssp = function (editor, query, http) {
        for (var i = 0; i < http.columns.length; i++) {
            var column = http['columns'][i];
            if (column.columnControl) {
                var field = editor.field(column['data']);
                // `<input>` based searches
                if (column.columnControl.search) {
                    var search = column.columnControl.search;
                    var value = search.value;
                    var logic = search.logic;
                    var type = search.type;
                    if (type === 'num') {
                        ColumnControl._sspNumber(query, field, value, logic);
                    }
                    else if (type === 'date') {
                        ColumnControl._sspDate(query, field, value, logic, search.mask);
                    }
                    else {
                        ColumnControl._sspText(query, field, value, logic);
                    }
                }
                // SearchList
                if (column.columnControl.list) {
                    var list = column.columnControl.list;
                    query.whereIn(field.dbField(), list);
                }
            }
        }
    };
    /**
     * Add conditions to a query for a ColumnControl date search.
     *
     * @param query Query to add the conditions to
     * @param field Field for the column in question
     * @param value Search term
     * @param logic Search logic
     * @param mask Mask value
     * @returns void
     */
    ColumnControl._sspDate = function (query, field, value, logic, mask) {
        var dbField = field.dbField();
        var search = '(?)';
        // Only support date and time masks. This departs from the client side which allows
        // any component in the date/time to be masked out.
        if (mask === 'YYYY-MM-DD') {
            dbField = 'DATE(' + dbField + ')';
            search = 'DATE(?)';
        }
        else if (mask === 'hh:mm:ss') {
            dbField = 'TIME(' + dbField + ')';
            search = 'TIME(?)';
        }
        if (logic === 'empty') {
            query.whereNull(field.dbField());
        }
        else if (logic === 'notEmpty') {
            query.whereNotNull(field.dbField());
        }
        else if (value === '') {
            // Empty search value means no search for the other logic operators
            return;
        }
        else if (logic === 'equal') {
            query.whereRaw(dbField + ' = ' + search, [value]);
        }
        else if (logic === 'notEqual') {
            query.whereRaw(dbField + ' != ' + search, [value]);
        }
        else if (logic === 'greater') {
            query.whereRaw(dbField + ' > ' + search, [value]);
        }
        else if (logic === 'less') {
            query.whereRaw(dbField + ' < ' + search, [value]);
        }
    };
    /**
     * Add conditions to a query for a ColumnControl number search.
     *
     * @param query Query to add the conditions to
     * @param field Field for the column in question
     * @param value Search term
     * @param logic Search logic
     * @returns void
     */
    ColumnControl._sspNumber = function (query, field, value, logic) {
        if (logic === 'empty') {
            query.where(function (q) {
                q.whereNull(field.dbField());
                q.orWhere(field.dbField(), '=', '');
            });
        }
        else if (logic === 'notEmpty') {
            query.where(function (q) {
                q.whereNotNull(field.dbField());
                q.where(field.dbField(), '!=', '');
            });
        }
        else if (value === '') {
            // Empty search value means no search for the other logic operators
            return;
        }
        else if (logic === 'equal') {
            query.where(field.dbField(), '=', value);
        }
        else if (logic === 'notEqual') {
            query.where(field.dbField(), '!=', value);
        }
        else if (logic === 'greater') {
            query.where(field.dbField(), '>', value);
        }
        else if (logic === 'greaterOrEqual') {
            query.where(field.dbField(), '>=', value);
        }
        else if (logic === 'less') {
            query.where(field.dbField(), '<', value);
        }
        else if (logic === 'lessOrEqual') {
            query.where(field.dbField(), '<=', value);
        }
    };
    /**
     * Add conditions to a query for a ColumnControl test search.
     *
     * @param query Query to add the conditions to
     * @param field Field for the column in question
     * @param value Search term
     * @param logic Search logic
     * @returns void
     */
    ColumnControl._sspText = function (query, field, value, logic) {
        if (logic === 'empty') {
            query.where(function (q) {
                q.whereNull(field.dbField());
                q.orWhere(field.dbField(), '=', '');
            });
        }
        else if (logic === 'notEmpty') {
            query.where(function (q) {
                q.whereNotNull(field.dbField());
                q.where(field.dbField(), '!=', '');
            });
        }
        else if (value === '') {
            // Empty search value means no search for the other logic operators
            return;
        }
        else if (logic === 'equal') {
            query.where(field.dbField(), '=', value);
        }
        else if (logic === 'notEqual') {
            query.where(field.dbField(), '!=', value);
        }
        else if (logic === 'contains') {
            query.where(field.dbField(), 'like', '%' + value + '%');
        }
        else if (logic === 'notContains') {
            query.where(field.dbField(), 'not like', '%' + value + '%');
        }
        else if (logic === 'starts') {
            query.where(field.dbField(), 'like', value + '%');
        }
        else if (logic === 'ends') {
            query.where(field.dbField(), 'like', '%' + value);
        }
    };
    return ColumnControl;
}());
exports.default = ColumnControl;

//# sourceMappingURL=columnControl.js.map
