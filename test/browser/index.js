const DEFAULT_TIMEOUT = 1000;

module.exports = {
	'Page Title'(browser) {
		browser
		.url('http://localhost:9099')
		.waitForElementVisible('body', DEFAULT_TIMEOUT)
		.assert.title('BookBrainz – The Open Book Database')
		.end();
	},
	afterEach(browser, done) {
		browser.customSauceEnd();

		setTimeout(done, DEFAULT_TIMEOUT);
	}
};
