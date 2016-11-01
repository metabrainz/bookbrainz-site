// Based on code from:
// https://github.com/saucelabs-sample-test-frameworks/JS-Nightwatch.js

'use strict';

const SauceLabs = require('saucelabs');

exports.command = function command() {
	const saucelabs = new SauceLabs({
		username: process.env.SAUCE_USERNAME,
		password: process.env.SAUCE_ACCESS_KEY
	});

	const sessionid = this.capabilities['webdriver.remote.sessionid'];
	const jobName = this.currentTest.name;

	saucelabs.updateJob(sessionid, {
		passed: this.currentTest.results.failed === 0,
		name: jobName
	}, () => {
		// empty
	});

	this.end();
};
