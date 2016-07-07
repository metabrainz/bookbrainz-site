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

In order to use the `gulp` command, you have to install it globally:

    npm install -g gulp

If you prefer not installing packages globally, you can skip this step and use `node_modules/.bin/gulp` instead of `gulp` in the later steps.

You can then install gulp locally:

    npm install gulp


You also need to install [redis](http://redis.io/) either locally or have a machine running it available.

## Configuration

Create a copy of development.json.example and rename it to development.json. Then, edit the values so that they are correct
for your environment.

## Building and running
### Building the client-side JS

The client-side JS is designed to use the `require()` function provided by
browserify. In order to get usable JS files, the source JS has to be processed
by browserify and then minified. There are two built-in gulp tasks to
accomplish this.

    gulp
    gulp compress

### Running the site

To run the site after installing dependencies and compiling the client-side JS,
use the following command. The server will automatically restart after any
changes are made to the code:

    npm run debug
