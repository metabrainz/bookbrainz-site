import chai, {expect} from 'chai';
import {mkdir, mkdtemp, readdir, rm, writeFile} from 'fs/promises';
import chaiHttp from 'chai-http';
import {createRouterBridge} from '../../../../src/server/helpers/router-build';
import {execFile} from 'child_process';
import express from 'express';
import orm from '../../../bookbrainz-data';
import path from 'path';
import {promisify} from 'util';


chai.use(chaiHttp);
const rootDir = path.resolve(__dirname, '../../../..');
function getSearchClient() {
	// These routes do not access search.
}
let bridge;

before(async () => {
	bridge = await createRouterBridge({getSearchClient, mode: 'production', orm, rootDir});
});

after(async () => { await bridge?.close(); });

function createApp() {
	const app = express();
	bridge.assets.forEach((middleware) => app.use(middleware));
	app.use((req, res, next) => {
		req.session = {};
		req.user = {id: 7, name: 'bridge-editor', privs: 1};
		res.locals.alerts = [{level: 'info', message: 'bridge-context-marker'}];
		next();
	});
	app.get('/express-only', (req, res) => res.send('answered by Express'));
	app.get('*', bridge.handler);
	app.use((req, res) => res.status(404).send('Express 404'));
	return app;
}

async function expectStartupFailure(root, mode, pattern) {
	let failure;
	try { await createRouterBridge({getSearchClient, mode, orm, rootDir: root}); }
	catch (error) { failure = error; }
	expect(failure).to.be.instanceOf(Error);
	expect(failure.message).to.match(pattern);
}

describe('Router bridge', () => {
	it('lets Express answer first', async () => {
		const response = await chai.request(createApp()).get('/express-only');
		expect(response.status).to.equal(200);
		expect(response.text).to.equal('answered by Express');
	});

	it('shares the built context with loaders', async () => {
		const response = await chai.request(createApp()).get('/no-such-page');
		expect(response.status).to.equal(404);
		expect(response.text).to.contain('Page not found');
		expect(response.text).to.contain('/no-such-page');
		expect(response.text).to.contain('bridge-context-marker');
		expect(response.text).to.contain('bridge-editor');
	});

	it('leaves non-GET requests to Express', async () => {
		const response = await chai.request(createApp()).post('/no-such-page');
		expect(response.status).to.equal(404);
		expect(response.text).to.equal('Express 404');
	});

	it('serves data responses without rendering HTML', async () => {
		const response = await chai.request(createApp()).get('/no-such-page.data');
		expect(response.status).to.equal(404);
		expect(response.type).not.to.equal('text/html');
	});

	it('serves generated JavaScript at /assets', async () => {
		const files = await readdir(path.join(rootDir, 'build-router/client/assets'));
		const file = files.find((name) => name.endsWith('.js'));
		expect(file).to.be.a('string');
		const response = await chai.request(createApp()).get(`/assets/${file}`);
		expect(response.status).to.equal(200);
		expect(response.type).to.match(/javascript/);
		expect(response.headers['cache-control']).to.contain('immutable');
	});

	it('rejects a missing production build', async () => {
		await expectStartupFailure(path.join(rootDir, 'missing-build'), 'production', /Cannot find module/);
	});

	it('rejects a broken Vite configuration', async () => {
		const root = await mkdtemp(path.join(rootDir, '.router-check-'));
		try {
			await writeFile(path.join(root, 'vite.config.mts'), 'export default {');
			await expectStartupFailure(root, 'development', /end of file/);
		}
		finally { await rm(root, {force: true, recursive: true}); }
	});

	it('rejects an invalid route import before listening', async () => {
		const root = await mkdtemp(path.join(rootDir, '.router-check-'));
		try {
			await mkdir(path.join(root, 'app'));
			await writeFile(path.join(root, 'vite.config.mts'),
				"import {reactRouter} from '@react-router/dev/vite'; export default {plugins: [reactRouter()], server: {hmr: false}};");
			await writeFile(path.join(root, 'app/root.tsx'), 'export default function Root() { return null; }');
			await writeFile(path.join(root, 'app/routes.ts'),
				"import {index} from '@react-router/dev/routes'; export default [index('broken.tsx')];");
			await writeFile(path.join(root, 'app/broken.tsx'),
				"import './missing-module'; export default function Broken() { return null; }");
			const {stdout} = await promisify(execFile)(process.execPath,
				[path.join(rootDir, 'test/fixtures/router-startup.cjs'), root], {timeout: 30000});
			expect(stdout).to.contain('missing-module');
		}
		finally { await rm(root, {force: true, recursive: true}); }
	});
});
