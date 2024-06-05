/*
 * Copyright (C) 2015-2017  Sean Burke
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {existsSync, readFileSync} from 'fs';
import {normalize} from 'path';


let configContents;

// Use Default configuration (for Docker)
function useDefaultConfig() {
	/* Pull in environment-specific configuration. */
	// eslint-disable-next-line node/no-process-env
	const env = process.env.NODE_ENV || 'development';

	let configFileBasename = 'config';
	if (env === 'test') {
		configFileBasename = 'test';
	}
	try {
		configContents =
			readFileSync(`config/${configFileBasename}.json`);
	}
	catch (err) {
		throw Error(`Could not find required configuration file \
config/${configFileBasename}.json If you don't have a \
config/${configFileBasename}.json file, you should copy, \
rename and modify config/config.json.example. For more \
information refer to: \
https://github.com/metabrainz/bookbrainz-site#configuration\n`);
	}
}

function checkConfigOverwrite() {
	const args = process.argv;
	const configIndex = args.indexOf('--config');

	// Check for '--config' followed by 'configPathFile'
	if (configIndex !== -1) {
		let configFilePath = args[configIndex + 1];
		if (!configFilePath) { throw Error('Missing configuration file path'); }

		configFilePath = normalize(configFilePath);
		if (existsSync(configFilePath)) {
			configContents = readFileSync(configFilePath);
		}
		else {
			throw Error(`${configFilePath} does not exist`);
		}
	}
	else { useDefaultConfig(); }
}

try {
	checkConfigOverwrite();
}
catch (exception) {
	// eslint-disable-next-line no-console
	console.log(`${exception.toString()}. Using Default configuration instead.`);
	useDefaultConfig();
}

const config = JSON.parse(configContents);

export default config;
