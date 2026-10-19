/* eslint-disable node/no-process-env */
// Sentry must be initialised before any other module is loaded so that
// its auto-instrumentation can hook into express, http, pg, etc.
// Importing this file first in app.js is therefore required.
import * as Sentry from '@sentry/node';


// Without a DSN (local development, tests) the SDK is never started
if (process.env.SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		environment: process.env.SENTRY_ENVIRONMENT || process.env.DEPLOY_ENV || process.env.NODE_ENV,
		release: process.env.GIT_COMMIT_SHA,
		tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1)
	});
}
