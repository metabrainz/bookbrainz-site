import {get as _get} from 'lodash';
import config from './config';
import {createClient} from 'redis';


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
			return JSON.parse(cachedValue) as T;
		}
	}
}

export function cacheJSON(cacheKey: string, value: any, options: {expireTime: number}) {
	if (redisClient.isReady) {
		return redisClient.set(cacheKey, JSON.stringify(value), {EX: options.expireTime});
	}
}

export default redisClient;
