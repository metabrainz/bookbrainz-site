# BookBrainz Site

[![Build Status](https://img.shields.io/travis/bookbrainz/bookbrainz-site.svg)](https://travis-ci.org/bookbrainz/bookbrainz-site)
[![Dependency Status](https://img.shields.io/david/bookbrainz/bookbrainz-site.svg)](https://david-dm.org/bookbrainz/bookbrainz-site)
[![devDependency Status](https://img.shields.io/david/dev/bookbrainz/bookbrainz-site.svg)](https://david-dm.org/bookbrainz/bookbrainz-site#info=devDependencies)
[![Code Climate](https://img.shields.io/codeclimate/github/BookBrainz/bookbrainz-site.svg)](https://codeclimate.com/github/BookBrainz/bookbrainz-site)
<a href="https://www.browserstack.com/">
<img src="https://bookbrainz.org/images/BrowserStack.svg" height="20px"></img>
</a>
<hr>
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


<br/>
<br/>

# Setting up a local BookBrainz server

BookBrainz depends on having PostgreSQL, Redis, Elasticsearch and NodeJS set
up and running.


## Running dependencies using Docker

The easiest way to get a local developement server running is [using Docker](https://docs.docker.com/get-started/part2/).
This will save you a fair amount of set up.

You'll need to install Docker and Docker-compose on your development machine:
  - [Docker](https://docs.docker.com/install/)
  - [docker-compose](https://docs.docker.com/compose/install/)

When that is installed, clone the repository and follow the instructions below step by step.

If you wish, you can instead [install the database and search dependencies on your machine](./MANUAL_INSTALL.md),
and/or [run the NodeJS server locally](./NODEJS_SETUP.md) while using dockerized dependencies.

## Cloning

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


## Configuration

Create a copy of `config/config.json.example` and rename it to `config.json`.
You can do this by running this command from the bookbrainz-site directory:

`cp config/config.json.example config/config.json`


If you want to be able to sing-up and edit, you will need to set up authentication under `musicbrainz`.
To get the `clientID` and `clientSecret` tokens, head to [the MusicBrainz website](https://musicbrainz.org/account/applications)
and register a new developer application. You can then copy the tokens for that developer application and paste as strings. 

## Database set-up

When you first start working with BookBrainz, you will need to perform some initialization for PostgreSQL and import the latest BookBrainz
database dump.

Luckily, we have a script that does just that: from the command line, in the `bookbrainz-site` folder, type and run `./scripts/database-init-docker.sh`.
The process may take a while as Docker downloads and builds the images. Let that run until the command returns.


## Running the server

If all went well, you will only need to run `./develop.sh` in the command line from the `bookbrainz-site` folder.
Press `ctrl+c` to stop the server. The dependencies will continue running in the background.

Wait until the console output gets quiet and this line appears: `> cross-env SSR=true node ./lib/server/app.js`.
After a few seconds, you can then point your browser to `localhost:9099`.

Make changes to the code in the `src` folder and run `./develop.sh` again to rebuild and run the server.

Once you are done developing, you can stop the dependencies running in docker in the background by typing `docker-compose down`.

### Advanced users
Advanced users may want to use Webpack to build, watch files and inject rebuilt pages without having to refresh the page,
keeping the application state intact, for the prie of a longer compilation time.

For that, you will need to modify the `docker-compose.yml` file to mount the `src` folder and change the command to
- `npm run debug` if you only want to change client files (in `src/client`)
- `npm run debug-watch-server` if you *also* want to modify server files (in `src/server`)

For example:
```
service:
  bookbrainz-site:
    command: npm run debug
    volumes:
      - "./src:/home/bookbrainz/bookbrainz-site/src"
```

<br/>
<hr>
<br/>

## Testing
The test suite is built using Mocha and Chai. Before running the tests, you will need to set up a `bookbrainz_test` database in postgres. Here are the instructions to do so:

Run the following postgres commands to create and set up the bookbrainz_test database:
  - `psql -c 'CREATE DATABASE bookbrainz_test;' -U postgres`
  - `psql -c 'CREATE EXTENSION "uuid-ossp"; CREATE SCHEMA musicbrainz; CREATE SCHEMA bookbrainz;' -d bookbrainz_test -U postgres`
  - `psql -f sql/schemas/musicbrainz.sql -d bookbrainz_test -U postgres`
  - `psql -f sql/schemas/bookbrainz.sql -d bookbrainz_test -U postgres`
  - `psql -f sql/scripts/create_triggers.sql -d bookbrainz_test -U postgres`
