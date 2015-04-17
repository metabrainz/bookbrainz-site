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
* public/js - minified JavaScript files which are referred to by the
  site pages.

Installing dependencies
-----------------------

Dependencies can be installed using the node package manager:

    npm install

In order to use the `gulp` command, you have to install it globally:

    npm install -g gulp

If you prefer not installing packages globally, you can skip this step and use `node_modules/.bin/gulp` instead of `gulp` in the later steps.

You also need to install [redis](http://redis.io/) either locally or have a machine running it available.

Configuration
-------------

In order for the site to work, it requires an updated BookBrainz [webservice](https://github.com/bookbrainz/bookbrainz-ws) (the backend) and a redis server for storing user sessions.

Redis is quite easy to set up but setting up your own webservice does require a bit more work. If you however do not want to go through the hassle of doing this, the MetaBrainz foundation provides a public development webservice.

Create a copy of development.json.example and rename it to development.json.
You can then either leave it as is to use the public development webservice or change the variables to point to your own.
Be aware that you will have to change the clientID if you do the latter.

Building the client-side JS
---------------------------

The client-side JS is designed to use the `require()` function provided by
browserify. In order to get usable JS files, the source JS has to be processed
by browserify and then minified. There are two built-in gulp tasks to
accomplish this.

    gulp
    gulp compress

Running the site
----------------

To run the site after installing dependencies and compiling the client-side JS,
use the following command:

    npm run-script debug

Or, if you're using Windows:

    npm run-script debug_win

Watch Mode
----------

If you're doing rapid prototyping of some new feature, it can be helpful to run the site in watch mode,
where every change to any source file results in a reloading of the server.

After nodemon is installed, run these two commands in separate terminal windows:

    gulp watch
    DEBUG=bbsite nodemon ./bin/www

Or on Windows:

    gulp watch
    set DEBUG=bbsite & nodemon bin\\www

Code Formatting
---------------

If you ever intend to push any code to the BookBrainz Site repository, or open
a pull request, ensure you have set up the project's pre-commit git hook. You
can do this by first installing the node module jscs globally:

    npm install -g jscs

And finally creating a symbolic link from .githooks/pre-commit to .git/hooks/pre-commit:

    ln -s ../../.githooks/pre-commit .git/hooks/pre-commit
    
  On Windows run the following command from an administrative cmd, creating a shortcut will *not* work:
  
    mklink .git\hooks\pre-commit ..\..\.githooks\pre-commit

This will check that your code is formatted correctly for contribution to the
project.
