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

## Setting up a local BookBrainz server
### Installing Dependencies
BookBrainz depends on having PostgreSQL, Redis and Elasticsearch and NodeJS set
up and running.

To get PostgreSQL, use one of the following commands:

**Debian-based OS**

    sudo apt-get install postgresql

**Red Hat-based OS**

    sudo yum install postgresql-server

To install Redis, run similar commands to get the dependency from your package
manager:

**Debian-based OS**

    sudo apt-get install redis-server

**Red Hat-based OS**

    sudo yum install redis

To install Elasticsearch, follow the instructions at https://www.elastic.co/guide/en/elasticsearch/reference/current/_installation.html

And finally, for NodeJS, choose the correct installation file, or view the
instructions for package managers at https://nodejs.org/en/download/current/

### Setting up Dependencies
No setup is required for Redis or Elasticsearch. However, it is necessary to
perform some initialization for PostgreSQL and import the latest BookBrainz
database dump.

Firstly, begin downloading the latest BookBrainz dump from https://bookbrainz.org/dumps/latest.tar.bz2.

Then, uncompress the `latest.tar.bz2` file, using the bzip2 command:

    bzip2 -d latest.tar.bz2

This will give you a file that you can *restore* into PostgreSQL, which will
set up data identical to the data we have on the bookbrainz.org website. To do
this, run:

    sudo -u postgres pg_restore -e -C -O latest.tar -d postgres

At this point, the database is set up, and the following command should give
you a list of usernames of BookBrainz editors (after entering the password from
earlier):

    sudo -u postgres psql bookbrainz -c "SELECT name FROM bookbrainz.editor"

### Cloning

Since this project makes use of
[git submodules](https://www.git-scm.com/book/en/v2/Git-Tools-Submodules), you
need to use `git clone --recursive` to clone it. Alternatively you can follow
the directions in the documentation linked here to manually initialize
submodules.

Currently used submodules:
*  [MonkeyDo/lobes](https://github.com/MonkeyDo/lobes) in `src/client/stylesheets/lobes`

To clone the repository and point the local HEAD to the latest commit in the
`stable` branch, something like the following command should work:

    git clone --recursive https://github.com/bookbrainz/bookbrainz-site.git

### Installing Packages
The site depends on a number of node packages, which can be installed using yarn,
which can be installed using npm:

    npm install -g yarn
    yarn install

This command will also compile the site LESS and JavaScript source files.

## Configuration
Create an account on  https://musicbrainz.org. Go to https://musicbrainz.org/account/applications and set up an application
using any name with web application and put `http://localhost:9099/cb`  in rollback URL section.

Go to Config directory and Create a copy of development.json.example and rename it to development.json.
Then, edit the values of clientID, clientSecret of musicBrainz section, values of clientID and clientSecret are given created 
application and change the PostgreSQL username and password.

## Building and running
A number of subcommands exist to manage the installation and run the server.
Before using these subcommands <br/> like `npm start`, you should must start redis server using command: `redis-server` and Elasticsearch server. <br/>
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

    yarn run browser-test
