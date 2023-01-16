import { Knex } from 'knex';
import { ILeftJoin } from './editor';
export declare function leftJoin(query: Knex.QueryBuilder, leftJoin: ILeftJoin[]): void;
