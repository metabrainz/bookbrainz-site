/* eslint-disable no-console, import/no-commonjs, @typescript-eslint/no-var-requires, node/no-missing-require */
// eslint-disable-next-line node/no-unpublished-require -- exercise the compiled server artifact
const {createRouterBridge} = require('../../lib/server/helpers/router-build');


createRouterBridge({
	getSearchClient() {
		// This fixture does not use search.
	},
	mode: 'development',
	orm: {},
	rootDir: process.argv[2]
}).then(async (bridge) => {
	await bridge.close();
	throw new Error('Expected startup to reject');
}).catch((error) => {
	console.log(error.message);
	if (!error.message.includes('missing-module')) {
		process.exitCode = 1;
	}
});
