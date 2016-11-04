# BookBrainz Site
[![Build Status](https://img.shields.io/travis/bookbrainz/bookbrainz-site.svg)](https://travis-ci.org/bookbrainz/bookbrainz-site)
[![Dependency Status](https://img.shields.io/david/bookbrainz/bookbrainz-site.svg)](https://david-dm.org/bookbrainz/bookbrainz-site)
[![devDependency Status](https://img.shields.io/david/dev/bookbrainz/bookbrainz-site.svg)](https://david-dm.org/bookbrainz/bookbrainz-site#info=devDependencies)
[![Code Climate](https://img.shields.io/codeclimate/github/BookBrainz/bookbrainz-site.svg)](https://codeclimate.com/github/BookBrainz/bookbrainz-site)
<a href="https://www.browserstack.com/">
<img src="https://bookbrainz.org/images/BrowserStack.svg" height="20px"></img>
</a>

This repository contains the code for the BookBrainz web site. The directories
are arranged as follows:

* config - the config to be used when running the site - copy the example files and edit, dropping the ".example" suffix.
* scripts - scripts used during the development and deployment of BookBrainz.
* src - node.js source files defining the site logic and user interface.
* static - static files which are served by node as part of the site.
* templates - Jade templates defining how the site looks - we're slowly
replacing these with React.
* test - unit tests and functional tests for the site

Additionally, after building the client JavaScript (see below), the following
directories will exist:

* static/stylesheets - the CSS generated from compiling the project LESS files (src/client/stylesheets).
* static/js - minified JavaScript files which are referred to by the
  site pages.

## Setup
### Cloning

Since this project makes use of [git submodules](https://www.git-scm.com/book/en/v2/Git-Tools-Submodules), you need to use `git clone --recursive` to clone it. Alternatively you can follow the directions in the documentation linked here to manually initialize submodules.

Currently used submodules:
*  [MonkeyDo/lobes](https://github.com/MonkeyDo/lobes) in `src/client/stylesheets/lobes`

## Installing dependencies

Dependencies can be installed using the node package manager:

    npm install

You also need to install [postgres](https://www.postgresql.org/) and
[redis](http://redis.io/).

## Configuration

Create a copy of development.json.example and rename it to development.json.
Then, edit the values so that they are correct for your environment.

## Building and running
A number of subcommands exist to manage the installation and run the server.
These are described here - any commands not listed should not be called
directly:

	* start - start the server in production mode, with code built once
	* debug - start the server in debug mode, with code watched for changes
	* lint - check the code for syntax and style issues
	* test - perform linting and attempt to compile the code
	* jsdoc - build the documentation for JSDoc annotated functions within the code

## Testing
### Browser Tests
Browser testing, using Selenium, allows for the overall system to be tested
to see if it looks and behaves as expected in a range of web browsers. This is
more complex to set up, and must be run manually.

Firstly, the main developers use Sauce Labs for browser testing in the cloud.
To run browser tests, you'll want to sign up to this service,
[here](https://saucelabs.com/) - there is a free open source plan.

Secondly, download [Sauce
Connect](https://wiki.saucelabs.com/display/DOCS/Basic+Sauce+Connect+Setup) to
allow the selenium clients at Sauce Labs to tunnel through to your locally
hosted instance of BookBrainz. You'll need to run Sauce Connect, providing it
with your Sauce Labs username and access key, as follows:

    ./sc -u YOUR_USERNAME -k YOUR_ACCESS_KEY

Finally, run the BookBrainz server, as detailed in the previous section of this
README, and then run the browser testing command:

    npm run browser-test
