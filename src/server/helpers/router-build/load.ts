import express, {type RequestHandler} from 'express';
import type {createRequestHandler} from '@react-router/express';
import path from 'path';
import {pathToFileURL} from 'url';


type Build = Parameters<typeof createRequestHandler>[0]['build'];
type LoadContextModule = typeof import('../../../../app/load-context');

export type LoadedRouterBuild = {
	// Express middleware to mount before the page handler: Vite in development, the built client files in production
	assets: RequestHandler[],
	build: Build,
	close: () => Promise<void>,
	getCreateLoadContext: () => Promise<LoadContextModule['createLoadContext']>
};

/*
 * The React Router build is an ES module and this server is compiled to CommonJS, where Babel would turn a plain
 * import() into require(). `new Function` keeps Babel from rewriting it.
 */
// eslint-disable-next-line no-new-func
const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<unknown>;

async function loadDevelopment(rootDir: string): Promise<LoadedRouterBuild> {
	const vite = await dynamicImport('vite') as typeof import('vite');
	const server = await vite.createServer({appType: 'custom', root: rootDir, server: {middlewareMode: true}});
	function build() {
		return server.ssrLoadModule('virtual:react-router/server-build') as ReturnType<Extract<Build, () => unknown>>;
	}
	function loadContextModule() {
		return server.ssrLoadModule('/app/load-context.ts') as Promise<LoadContextModule>;
	}

	// Fail now if the pages do not compile, not on the first request
	try {
		await build();
	}
	catch (error) {
		await server.close();
		throw error;
	}
	return {
		assets: [server.middlewares as RequestHandler],
		build,
		close: () => server.close(),
		// Loaded again for every request, so that after a hot update it matches the routes
		getCreateLoadContext: async () => (await loadContextModule()).createLoadContext
	};
}

async function loadProduction(rootDir: string): Promise<LoadedRouterBuild> {
	const serverDir = path.join(rootDir, 'build-router', 'server');
	const build = await dynamicImport(pathToFileURL(path.join(serverDir, 'index.mjs')).href) as Build;
	const {createLoadContext} = await dynamicImport(
		pathToFileURL(path.join(serverDir, 'load-context.mjs')).href
	) as LoadContextModule;
	const clientFiles = express.static(path.join(rootDir, 'build-router', 'client', 'assets'), {immutable: true, maxAge: '1y'});
	return {
		assets: [express.Router().use('/assets', clientFiles)],
		build,
		close: () => Promise.resolve(),
		getCreateLoadContext: () => Promise.resolve(createLoadContext)
	};
}

export function loadRouterBuild(mode: 'development' | 'production', rootDir: string): Promise<LoadedRouterBuild> {
	return mode === 'development' ? loadDevelopment(rootDir) : loadProduction(rootDir);
}
