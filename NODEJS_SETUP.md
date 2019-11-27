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

Our `config.example.json` is set up to work out of the box running everything in Docker. Addresses for the dependencies refer to docker container names, so that containers can communicate with each other.

For local development (run outside of Docker), make a copy of `config/config.local.json.example` and [fill up the musicbrainz tokens](README.md#configuration). You can then pass this configuration file when running the server locally using `--config` flag.
For example, `npm start -- --config ./config/config.local.json` will use `./config/config.local.json` config instead of the Default config (`config.json` for Docker).

## Building and running
A number of subcommands exist to manage the installation and run the server.
These are described here; any commands not listed should not be called directly:

* start - start the server in production mode, with code built once
* debug - start the server in debug mode, with code watched for changes
* lint - check the code for syntax and style issues
* test - perform linting and attempt to compile the code
* jsdoc - build the documentation for JSDoc annotated functions within the
  code

# VSCode users
If you want to use VSCode to run and debug the server or API, here is a VSCode launch configuration for running both the server and the tests, useful in both cases to debug into the code.
Here is [a good introduction](https://www.youtube.com/watch?v=yFtU6_UaOtA) to debugging javascript in VSCode
1. At the root fo the repository, create a .vscode/launch.json file containing:
  ```
  {
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "env": {"SSR":true},
            "program": "${workspaceFolder}/lib/server/app.js",
            "sourceMaps": true,
            "preLaunchTask": "build-server-with-sourcemaps"
        },
        {
            "type": "node",
            "request": "launch",
            "name": "Mocha Tests",
            "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
            "args": [
                "--timeout", "999999",
                "--colors",
                "${workspaceFolder}/test/" // You can point to a specific file or folder to run only those tests
            ],
            "env": {"NODE_ENV":"test","SSR":true},
            "internalConsoleOptions": "openOnSessionStart",
            "preLaunchTask": "build-server-with-sourcemaps"
        }
    ]
}
  ```
2. Create a .vscode/tasks.json file containing:
  ```
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build-server-with-sourcemaps",
            "command": "${workspaceFolder}/node_modules/.bin/babel",
            "args": [
                "src",
                "--out-dir",
                "lib",
                "--source-maps"
            ],
            "isBackground": false
		},
		{
			"label": "build-client",
            "type": "npm",
            "script": "build-client-js",
            "problemMatcher": [],
			"isBackground": false,
		},
		{
			"label": "build-client-and server",
            "type": "npm",
            "script": "build",
            "problemMatcher": [],
			"isBackground": false,
        }
    ]
}	
 ```

BookBrainz uses [Flow](https://flow.org) as a javascript typechecking library. VSCode is partial to Typescript, and needs to be configured to avoid confusion.
We recommend you install the flow-for-vscode extension and [follow this setup step](https://github.com/flowtype/flow-for-vscode#setup):
`Set [VSCode configuration] javascript.validate.enable option to false or completely disable the built-in TypeScript extension for your project`
