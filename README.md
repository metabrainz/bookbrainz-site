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

* `config` - the config to be used when running the site; copy the example files
  and edit, dropping the `.example` suffix.
* `scripts` - scripts used during the development and deployment of BookBrainz.
* `src` - node.js source files defining the site logic and user interface.
* `static` - static files which are served by node as part of the site.
* `templates` - Jade templates defining how the site looks - we're slowly
  replacing these with React.
* `test` - unit tests and functional tests for the site.

Additionally, after building the client JavaScript (see below), the following
directories will exist:

* `static/stylesheets` - the CSS generated from compiling the project LESS files
  (`src/client/stylesheets`).
* `static/js` - minified JavaScript files which are referred to by the site
  pages.

## Documentation

Auto-generated developer documentation can be found at our corresponding
[doclets site](https://doclets.io/bookbrainz/bookbrainz-site/master). Our
contributing guide can be found [here](CONTRIBUTING.md).

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

To install Elasticsearch, follow the instructions at
https://www.elastic.co/guide/en/elasticsearch/reference/current/_installation.html

And finally, for NodeJS, choose the correct installation file, or view the
instructions for package managers at https://nodejs.org/en/download/current/

### Setting up Dependencies

No setup is required for Redis or Elasticsearch. However, it is necessary to
perform some initialization for PostgreSQL and import the latest BookBrainz
database dump.

Firstly, begin downloading the latest BookBrainz dump from
https://bookbrainz.org/dumps/latest.tar.bz2.

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
* [MonkeyDo/lobes](https://github.com/MonkeyDo/lobes) in
  `src/client/stylesheets/lobes`

To clone the repository and point the local HEAD to the latest commit in the
`stable` branch, something like the following command should work:

    git clone --recursive https://github.com/bookbrainz/bookbrainz-site.git

### Installing Packages
The site depends on a number of node packages which can be installed using npm:

    cd bookbrainz-site/
    npm install

This command will also compile the site LESS and JavaScript source files.

## Configuration

Create a copy of `config.json.example` and rename it to `config.json`. Then,
edit the values so that they are correct for your environment. If the prior
instructions have been followed, it should only be necessary to change
the PostgreSQL username and password.

## Building and running
A number of subcommands exist to manage the installation and run the server.
These are described here; any commands not listed should not be called directly:

* start - start the server in production mode, with code built once
* debug - start the server in debug mode, with code watched for changes
* lint - check the code for syntax and style issues
* test - perform linting and attempt to compile the code
* jsdoc - build the documentation for JSDoc annotated functions within the
  code

## Testing
The test suite is built using Mocha and Chai. Before running the tests, you will need to set up a `bookbrainz_test` database in postgres. Here are the instructions to do so:

  1. Clone the [bookbrainz-sql](https://github.com/bookbrainz/bookbrainz-sql.git) repository. We will refer below to the directory simply as `bookbrainz-sql/`
  2. Run the following postgres commands to create and set up the bookbrainz_test database:
  - `psql -c 'CREATE DATABASE bookbrainz_test;' -U postgres`
  - `psql -c 'CREATE EXTENSION "uuid-ossp"; CREATE SCHEMA musicbrainz; CREATE SCHEMA bookbrainz;' -d bookbrainz_test -U postgres`
  - `psql -f bookbrainz-sql/schemas/musicbrainz.sql -d bookbrainz_test -U postgres`
  - `psql -f bookbrainz-sql/schemas/bookbrainz.sql -d bookbrainz_test -U postgres`
  - `psql -f bookbrainz-sql/scripts/create_triggers.sql -d bookbrainz_test -U postgres`
  3. Profit.
