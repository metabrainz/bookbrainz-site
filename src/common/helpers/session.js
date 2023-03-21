import Debug from 'debug';
import RedisStore from 'connect-redis';
import {get as _get} from 'lodash';
import config from './config';
import redisClient from './cache';
import session from 'express-session';


const debug = Debug('bbsite');

/**
 * Set up sessions, using Redis in production and default to in-memory for testing environment.
 * @param {string} [environment] - Node.js environment.
 */
function setupSessions(environment) {
	const sessionOptions = {
		cookie: {
			maxAge: _get(config, 'session.maxAge', 2592000000),
			secure: _get(config, 'session.secure', false)
		},
		resave: false,
		saveUninitialized: false,
		secret: config.session.secret
	};

	if (environment !== 'test') {
		// eslint-disable-next-line no-console
		redisClient.connect().catch(redisError => { console.error('Redis error:', redisError); });

		redisClient.on('error', (err) => debug('Redis error:', err));

		const redisStore = new RedisStore({
			client: redisClient
		});
		sessionOptions.store = redisStore;
	}

	return session(sessionOptions);
}

export default setupSessions;
