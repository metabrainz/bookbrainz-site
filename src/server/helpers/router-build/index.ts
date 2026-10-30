import type {Alert, SiteSession, SiteUser} from '../../../common/types/site';
import {type Request as ExpressRequest, type NextFunction, type RequestHandler, type Response} from 'express';
import type {Client} from '@elastic/elasticsearch';
import type {ORM} from 'bookbrainz-data';
import {createBackend} from '../../../backend';
import {createRequestHandler} from '@react-router/express';
import {loadRouterBuild} from './load';


declare module 'express-serve-static-core' {
	interface Locals {
		alerts: Alert[],
		repositoryUrl: string,
		siteRevision: string
	}
	interface Request {signUpDisabled?: boolean;}
}

export type RouterBridge = {
	// Express middleware to mount before the page handler
	assets: RequestHandler[],
	close: () => Promise<void>,
	// Answers the GET requests Express did not handle
	handler: RequestHandler
};

type Options = {
	getSearchClient: () => Client | null,
	mode: 'development' | 'production',
	orm: ORM,
	rootDir: string
};

export async function createRouterBridge({getSearchClient, mode, orm, rootDir}: Options): Promise<RouterBridge> {
	const router = await loadRouterBuild(mode, rootDir);

	const handle = createRequestHandler({
		build: router.build,
		async getLoadContext(req: ExpressRequest, res: Response) {
			const createLoadContext = await router.getCreateLoadContext();
			const {session, user} = req as ExpressRequest & {session?: SiteSession, user?: SiteUser};
			return createLoadContext({
				alerts: res.locals.alerts,
				backend: createBackend({orm, searchClient: getSearchClient()}),
				mergeQueue: session?.mergeQueue,
				repositoryUrl: res.locals.repositoryUrl,
				session,
				signUpDisabled: Boolean(req.signUpDisabled),
				siteRevision: res.locals.siteRevision,
				// Of the editor row passport put on the request, loaders get only these fields
				user: user && {id: user.id, name: user.name, privs: user.privs}
			});
		}
	});

	return {
		assets: router.assets,
		close: router.close,
		handler: (req: ExpressRequest, res: Response, next: NextFunction) => handle(req, res, next)
	};
}
