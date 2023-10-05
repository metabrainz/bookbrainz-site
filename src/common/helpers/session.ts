import Debug from 'debug';
import RedisStore from 'connect-redis';
import {get as _get} from 'lodash';
import config from './config';
import redisClient from './cache';
import session from 'express-session';


type Session = {
	cookie: any,
	mergeQueue?: any,
	resave: boolean,
	saveUninitialized: boolean,
	secret: any,
	store?: any
};

declare module 'express-serve-static-core' {
	interface Request {
		session: Session;
	}
}

const debug = Debug('bbsite');

/**
 * Set up sessions, using Redis in production and default to in-memory for testing environment.
 * @param {string} [environment] - Node.js environment.
 * @returns {function} Express session request handler.
 */
function setupSessions(environment) {
	const sessionOptions: Session = {
		cookie: {
			maxAge: _get(config, 'session.maxAge', 2592000000),
			secure: _get(config, 'session.secure', false)
		},
		resave: false,
		saveUninitialized: false,
		secret: config.session.secret
	};

	if (environment !== 'test') {
		redisClient.connect().catch((redisError) => debug('Redis error:', redisError));

		redisClient.on('error', (redisError) => debug('Redis error:', redisError));

		const redisStore = new RedisStore({
			client: redisClient
		});
		sessionOptions.store = redisStore;
	}

	return session(sessionOptions);
}

export default setupSessions;
