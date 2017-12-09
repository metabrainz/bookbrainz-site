/*
 * Based on code from:
 * https://github.com/saucelabs-sample-test-frameworks/JS-Nightwatch.js
 */

import SauceLabs from 'saucelabs';

/* eslint-disable babel/no-invalid-this */
export function command() {
	const saucelabs = new SauceLabs({
		password: process.env.SAUCE_ACCESS_KEY,
		username: process.env.SAUCE_USERNAME
	});

	const sessionid = this.capabilities['webdriver.remote.sessionid'];
	const jobName = this.currentTest.name;

	saucelabs.updateJob(sessionid, {
		name: jobName,
		passed: this.currentTest.results.failed === 0
	}, () => {
		// empty
	});

	this.end();
}
/* eslint-enable babel/no-invalid-this */
