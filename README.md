BookBrainz Site
===============

This repository contains the code for the BookBrainz web site. The directories
are arranged as follows:

* bin - scripts used during the development and deployment of BookBrainz.
* public - static files which are served by node as part of the site.
* routes - node.js source files defining the endpoints of the site.
* views - Jade templates defining how the site looks, together with required
  client JavaScript.

Additionally, after building the client JavaScript (see below), the following
directories will exist:

* build - the browserify-built JavaScript files.
* public/javascripts - minified JavaScript files which are referred to by the
  site pages.

Installing dependencies
-----------------------

Dependencies can be installed using the node package manager:

    npm install

Building the client-side JS
---------------------------

The client-side JS is designed to use the require() function provided by
browserify. In order to get usable JS files, the source JS has to be processed
by browserify and then minified. There are two built-in grunt tasks to
accomplish this.

    grunt
    grunt uglify

Running the site
----------------

To run the site after installing dependencies and compiling the client-side JS,
use the following command:

    npm run-script debug

Or, if you're using Windows:

    npm run-script debug_win
