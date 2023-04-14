import {get as _get} from 'lodash';
import config from './config';
import {createClient} from 'redis';
import log from 'log';


// Set up Redis, which is used for sessions and to cache requests to external APIs
const redisHost = _get(config, 'session.redis.host', 'localhost');
const redisPort = _get(config, 'session.redis.port', 6379);
const redisClient = createClient({
	url: `redis://${redisHost}:${redisPort}`
});

export async function getCachedJSON<T>(cacheKey: string) {
	if (redisClient.isReady) {
		const cachedValue = await redisClient.get(cacheKey);
		if (cachedValue) {
			try {
				return JSON.parse(cachedValue) as T;
			}
			catch (error) {
				// Should not happen, but in this case we deliberately fail to return a cached value.
				// This way we give the caller a chance to overwrite the broken entry with a recomputed value.
				log.error(`Cache contains invalid JSON for the key "${cacheKey}": ${error.message}`);
			}
		}
	}
	return null;
}

export function cacheJSON(cacheKey: string, value: any, options: {expireTime: number}) {
	if (redisClient.isReady) {
		try {
			return redisClient.set(cacheKey, JSON.stringify(value), {EX: options.expireTime});
		}
		catch (error) {
			// Should not happen, but in this case we deliberately fail to cache the value.
			log.error(`Failed to cache invalid JSON for the key "${cacheKey}": ${error.message}`);
		}
	}
	return null;
}

export default redisClient;
