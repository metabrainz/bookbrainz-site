# BookBrainz Site

[![Build Status](https://travis-ci.org/bookbrainz/bookbrainz-site.svg?branch=master)](https://travis-ci.org/bookbrainz/bookbrainz-site)
[![Dependency Status](https://img.shields.io/david/bookbrainz/bookbrainz-site.svg)](https://david-dm.org/bookbrainz/bookbrainz-site)
[![devDependency Status](https://img.shields.io/david/dev/bookbrainz/bookbrainz-site.svg)](https://david-dm.org/bookbrainz/bookbrainz-site#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/bookbrainz/bookbrainz-site/badge.svg)](https://snyk.io/test/github/bookbrainz/bookbrainz-site)
[![Coverage Status](https://coveralls.io/repos/github/bookbrainz/bookbrainz-site/badge.svg?branch=master)](https://coveralls.io/github/bookbrainz/bookbrainz-site?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/76f87309d52d75ff4a18/maintainability)](https://codeclimate.com/github/BookBrainz/bookbrainz-site/maintainability)
<a href="https://www.browserstack.com/">
<img src="https://bookbrainz.org/images/BrowserStack.svg" height="20px"></img>
</a>
<hr>
This repository contains the code for the BookBrainz web site. The directories
are arranged as follows:

* `config` - the config to be used when running the site; copy the example files
  and edit, dropping the `.example` suffix.
* `docker` - deployment files and configurations
* `scripts` - scripts used during the development and deployment of BookBrainz.
* `sql` - PostgreSQL database schemas and migration files—formerly separated in https://github.com/bookbrainz/bookbrainz-sql
* `src` - node.js source files defining the site logic and user interface.
* `static` - static files which are served by node as part of the site.
* `test` - unit tests and functional tests for the site.

Additionally, after building the client JavaScript (see below), the following
directories will exist:

* `lib` - compiled and minified server files
* `static/stylesheets` - the CSS generated from compiling the project LESS files
  (`src/client/stylesheets`).
* `static/js` - minified JavaScript files which are referred to by the site
  pages.
  
## Contact and updates

Any questions? You can get in contact with the community on [our IRC channel](https://webchat.freenode.net/?channels=#bookbrainz) or [our forums](https://community.metabrainz.org/c/bookbrainz), or send us [an email](mailto:bookbrainz@metabrainz.org)

Breaking changes to the database schema or our API will be announced on
[our blog](https://blog.metabrainz.org/category/bookbrainz/), along with our other major updates,
so consider following that.


## Contributing
We welcome any and all contributions ! Whether you want to add or improve entries on [bookbrainz.org](https://bookbrainz.org), fix an issue on the website or provide new functionnality, we'll be happy to have your help and count you part of our ranks !
If you are new to open source contribution workflows, have a look at [this beginner's guide](https://akrabat.com/the-beginners-guide-to-contributing-to-a-github-project/) and our [contribution guidelines](CONTRIBUTING.md).
Looking for existing issues, or to report a new bug you found? Head to our ticket tracker at https://tickets.metabrainz.org/projects/BB !
Still not sure what to start with? Have a look at [tickets tagged **good-first-bug**](https://tickets.metabrainz.org/issues/?jql=project%20%3D%20BB%20AND%20status%20in%20(Open%2C%20Reopened)%20AND%20resolution%20%3D%20Unresolved%20AND%20labels%20%3D%20good-first-bug%20ORDER%20BY%20priority%20DESC%2C%20updated%20DESC)

## Documentation

The auto-generated developer documentation is served alongisde this repository on Github Pages: https://bookbrainz.github.io/bookbrainz-site

Our contributing guidelines can be found [here](CONTRIBUTING.md).
<br/>
## Beta and test subdomains

We have two separate subdomains for the purpose of testing and rolling out beta features.
You can sign in with the same account as the one you use on the main website.

__[beta.bookbrainz.org](https://beta.bookbrainz.org)__ uses the main database but with a newer version of the code that hasn't been released yet. It is used to test new features.

__[test.bookbrainz.org](https://test.bookbrainz.org)__: all changes made to this subdomain are not in sync with the main database and vice versa.
This domain is for you to tinker with all features of the website freely without having to verify the correctness of the data you enter. This comes in handy if that's all you need to do instead of having to set up BookBrainz locally.
This subdomain is used for testing only and the data is not maintained or updated. It is not guaranteed that any of the data will be authentic.
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

Note: If you are using docker-toolbox you need to replace [elasticsearch:9200](/config/config.json.example#L30) with ip address of your docker-machine in `config.json`. To get ip address of your docker machine use command `docker-machine ip default` for more infomation regarding finding ip address of docker-machine refer [here](https://docs.docker.com/machine/reference/ip/)

## Cloning

To clone the repository and point the local HEAD to the latest commit in the
`stable` branch, something like the following command should work:

    git clone --recurse-submodules https://github.com/bookbrainz/bookbrainz-site.git

Since this project makes use of
git submodules, you
need to use `git clone --recurse-submodules` to clone it. Alternatively, to manually initialize
submodules, run these two commands:

	git submodule init
	git submodule update

Currently used submodule:
* [MonkeyDo/lobes](https://github.com/MonkeyDo/lobes) in
  `src/client/stylesheets/lobes`


## Configuration

Create a copy of `config/config.json.example` and rename it to `config.json`.
You can do this by running this command from the bookbrainz-site directory:

`cp config/config.json.example config/config.json`


If you want to be able to sign-up and edit, you will need to set up authentication under `musicbrainz`.
To get the `clientID` and `clientSecret` tokens, head to [the MusicBrainz website](https://musicbrainz.org/account/applications)
and register a new developer application. Make sure to enter the callback URL as `http://localhost:<port>/cb`(port: 9099 by default). You can then copy the tokens for that developer application and paste as strings in your `config/config.json`. The tokens and callback URL in your `config/config.json` needs to match exactly the one for the developer application.

## Database set-up

When you first start working with BookBrainz, you will need to perform some initialization for PostgreSQL and import the latest BookBrainz
database dump.

Luckily, we have a script that does just that: from the command line, in the `bookbrainz-site` folder, type and run `./scripts/database-init-docker.sh`.
The process may take a while as Docker downloads and builds the images. Let that run until the command returns.

The latest database dump can be found [at this address](http://ftp.musicbrainz.org/pub/musicbrainz/bookbrainz/latest.sql.bz2)

## Running the web server

If all went well, you will only need to run `./develop.sh` in the command line from the `bookbrainz-site` folder.
Press `ctrl+c` to stop the server. The dependencies will continue running in the background.

Wait until the console output gets quiet and this line appears: `> cross-env node ./lib/server/app.js`.
After a few seconds, you can then point your browser to `localhost:9099`.

Make changes to the code in the `src` folder and run `./develop.sh` again to rebuild and run the server.

Once you are done developing, you can stop the dependencies running in docker in the background by running `./stop.sh`.

## Running the API

As described above for running the web server, you can easily start the API with Docker by running  `./develop-api.sh`.

Point you browser to `localhost:9099/1/api-docs` to pull up the documentation and try out the api endpoints.

Don't forget to run `./stop.sh` once you are done developing to stop the dependencies that are running in the background.


## Advanced users and debugging

Once you get into serious work on the project, we recommend you use a debugger and [run the NodeJS server locally](./NODEJS_SETUP.md) (while still running dependencies in Docker for simplicity).
Using a debugger will allow you to pause and inspect the server code as it is being executed.

If you do not want to use Docker at all, you can also [install the database and search dependencies on your machine](./DEPENDENCIES_MANUAL_INSTALL.md)

## Watch files and live reload

When doing local development on your computer, you would have to stop and rebuild the application after every change you make to the codebase, then refresh the page to see the changes.

There is a more convenient development option set up for the project called "live reloading".
Saving a file will trigger a rebuild of the project (the "watch" part), and changes will automatically be reflected in the web page without the need to reload (the "live reload" part).
The current state of your page will also be preserved that way.

You will find the documentation for [watching files and live reloading here](./NODEJS_SETUP.md/#Watch-files-and-live-reload-with-Webpack)
 

# Testing
The test suite is built using Mocha and Chai. Before running the tests, you will need to set up a `bookbrainz_test` database in postgres. Here are the instructions to do so:

Run the following postgres commands to create and set up the bookbrainz_test database:
  - `psql -c 'CREATE DATABASE bookbrainz_test;' -U postgres -h localhost`
  - `psql -c 'CREATE EXTENSION "uuid-ossp"; CREATE SCHEMA musicbrainz; CREATE SCHEMA bookbrainz;' -d bookbrainz_test -U postgres -h localhost`
  - `psql -f sql/schemas/musicbrainz.sql -d bookbrainz_test -U postgres -h localhost`
  - `psql -f sql/schemas/bookbrainz.sql -d bookbrainz_test -U postgres -h localhost`
  - `psql -f sql/scripts/create_triggers.sql -d bookbrainz_test -U postgres -h localhost`

If you are running these commands from inside the `bookbrainz-site` docker container, replace `-h localhost` with `-h postgres`.
