
import {Knex} from 'knex';
import {ILeftJoin} from './editor';

export function leftJoin(query: Knex.QueryBuilder, leftJoin: ILeftJoin[]): void {
	if (leftJoin === null || leftJoin === undefined) {
		return;
	}

	for (let i = 0, ien = leftJoin.length; i < ien; i++) {
		let join = leftJoin[i];

		if (join.fn) {
			query.leftJoin(join.table, join.fn as any);
		}
		else {
			query.leftJoin(join.table, function() {
				this.on(join.field1, join.operator, join.field2);
			});
		}
	}
}
