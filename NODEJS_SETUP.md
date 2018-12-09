# Running the NodeJS server outside of Docker

If for some reason you do not want to use Docker, you can run the server code locally,
whether you are using Docker for the database and search dependencies or you [installed them manually](./MANUAL_INSTALL.md)

## Installing NodeJS

To install NodeJS, follow the instruction for your operating system on the [official website](https://nodejs.org/en/download/)


## Installing Packages
The site depends on a number of node packages which can be installed using npm:

    cd bookbrainz-site/
    npm install

This command will also compile the site LESS and JavaScript source files.

## Configuration

You will need to modify the `config/config.json` file* to point to the dependencies.
For example, if you are running the dependencies using Docker or locally, set `session.redis.host`, `database.connection.host` and `search.search` to point to `localhost` and adjust the ports accordingly.

*If it doesn't exist, make a copy of `config.example.json` and rename it) 

## Building and running
A number of subcommands exist to manage the installation and run the server.
These are described here; any commands not listed should not be called directly:

* start - start the server in production mode, with code built once
* debug - start the server in debug mode, with code watched for changes
* lint - check the code for syntax and style issues
* test - perform linting and attempt to compile the code
* jsdoc - build the documentation for JSDoc annotated functions within the
  code