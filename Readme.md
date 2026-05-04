# DataTables Node.js server-side libraries

This is a Node.js library to provide easy server-side support for [DataTables](https://datatables.net/) - _the_ Javascript table library.

These libraries provide support for:

* Server-side processing - work with millions of rows
* [Editor](https://editor.datatables.net) - CRUD UI for DataTables
* ColumnControl - Column search controls for DataTables
* SearchBuilder - Complex search logic UI

The library is framework-agnostic and can be used in any web framework. It uses [Knex.js](https://knexjs.org/) to work with many different databases, including Postgres, MySQL, SQLServer and Sqlite.


## Installation

Available on [NPM](https://www.npmjs.com/package/datatables.net-editor-server), this package can be installed with:

```sh
npm install --save datatables.net-editor-serverdatatables.net-editor-server
```

There are two primary entry point classes in the library:

* `DataTable` - for read only tables
* `Editor` - for read / write tables, with [Editor](https://editor.datatables.net/)

There are also a number of supporting classes such as `Options`, `Mjoin` and more.


## Quick Start

The database connection is a standard [Knex object](https://knexjs.org/guide/#configuration-options), configured to access your database.

The DataTables Node.js libraries expose both ESM and CJS modules and so can be loaded as appropriate for your software - e.g.:

```js
import { Editor, Field, Format, Validate } from 'datatables.net-editor-server';
````

or

```js
const { Editor, Field, Format, Validate } = require('datatables.net-editor-server');
```

The following shows an Express controller that makes use of the `Editor` class to handle all CRUD requests for a table with four columns defined. Validators and formatters are used were appropriate.

```js
import { Editor, Field, Format, Validate } from 'datatables.net-editor-server';
import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.all('/api/staff', async function (req, res) {
	let editor = new Editor(db, 'datatables_demo').fields(
		new Field('first_name').validator(Validate.notEmpty()),
		new Field('last_name').validator(Validate.notEmpty()),
		new Field('age')
			.validator(Validate.numeric())
			.setFormatter(Format.ifEmpty(null)),
		new Field('start_date')
			.validator(
				Validate.dateFormat(
					'YYYY-MM-DD',
					null,
					new Validate.Options().message(
						'Please enter a date in the format yyyy-mm-dd'
					)
				)
			)
			.getFormatter(Format.sqlDateToFormat('YYYY-MM-DD'))
			.setFormatter(Format.formatToSqlDate('YYYY-MM-DD'))
	);

	await editor.process(req.body);
	res.json(editor.data());
});

export default router;
```

Similarly, if your table is readonly, the `DataTable` and `Column` classes can be used (this will support DataTables' client-side or server-side processing modes):

```js
import { DataTable, Column } from 'datatables.net-editor-server';
import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.all('/api/staff', async function (req, res) {
	let table = new DataTable(db, 'datatables_demo').columns(
		new Column('first_name'),
		new Column('last_name'),
		new Column('age'),
		new Column('start_date')
			.getFormatter(Format.sqlDateToFormat('YYYY-MM-DD'))
	);

	await table.process(req.body);
	res.json(table.data());
});

export default router;
```


## Documentation

For full documentation, [please refer to the DataTables site](https://datatables.net/manual/nodejs).


## License

MIT — see [LICENSE](License.md) for full text.
