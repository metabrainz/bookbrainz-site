// Sentry must be initialised before any other module is loaded so that
// its auto-instrumentation can hook into express, http, pg, etc.
// Importing this file first in app.js is therefore required.
import * as Sentry from '@sentry/node';
import config from '../common/helpers/config';


// Without a DSN (local development, tests) the SDK is never started
if (config.sentry?.dsn) {
	Sentry.init({
		dsn: config.sentry.dsn,
		environment: config.sentry.environment,
		// eslint-disable-next-line node/no-process-env
		release: process.env.GIT_COMMIT_SHA,
		tracesSampleRate: config.sentry.tracesSampleRate
	});
}
