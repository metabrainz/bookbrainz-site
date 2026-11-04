/* eslint-disable import/no-mutable-exports */
import {createApp} from '../../src/server/app';
import orm from '../bookbrainz-data';


export let app;
let close;

before(async function createServerFixture() {
	// eslint-disable-next-line no-invalid-this -- Mocha hook context
	this.timeout(60000);
	({app, close} = await createApp({orm}));
});

after(async () => {
	await close?.();
	await orm.bookshelf.knex.destroy();
});
