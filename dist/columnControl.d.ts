import Editor, { IDtRequest } from './editor';
import { Knex } from 'knex';
export default class ColumnControl {
    static ssp(editor: Editor, query: Knex.QueryBuilder<any, any>, http: IDtRequest): void;
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
    private static _sspDate;
    /**
     * Add conditions to a query for a ColumnControl number search.
     *
     * @param query Query to add the conditions to
     * @param field Field for the column in question
     * @param value Search term
     * @param logic Search logic
     * @returns void
     */
    private static _sspNumber;
    /**
     * Add conditions to a query for a ColumnControl test search.
     *
     * @param query Query to add the conditions to
     * @param field Field for the column in question
     * @param value Search term
     * @param logic Search logic
     * @returns void
     */
    private static _sspText;
}
