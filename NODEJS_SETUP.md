# Running the NodeJS server outside of Docker

### These instruction are only valid for specific cases when you do not want to use Docker (`./develop.sh`) to run the server on your machine.

If for some reason you do not want to use our standard development environment (Docker), you can run the server code manually (
regardless of whether you are running dependencies with Docker for the database and search  or you [installed them manually](./MANUAL_INSTALL.md))

## Installing NodeJS

To install NodeJS, follow the instruction for your operating system on the [official website](https://nodejs.org/en/download/)


## Installing Packages
The site depends on a number of node packages which can be installed using npm:

    cd bookbrainz-site/
    npm install

This command will also compile the site LESS and JavaScript source files.

## Configuration

Our `config.example.json` is set up to work out of the box running everything in Docker. Adresses for the dependencies refer to docker container names, so that containers can communicate with each other.
You will need to modify the `config/config.json` file* to point to the dependencies from outside the Docker network.
For example, set `session.redis.host`, `database.connection.host` and `search.search` to point to `localhost` (or wherever your dependencies are running) and adjust the ports accordingly.

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
