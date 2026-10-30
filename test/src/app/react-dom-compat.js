import {expect} from 'chai';
import fs from 'fs';
import path from 'path';


// Run `yarn build-router` first. The bug this guards against: the browser bundle was built without the replacement for
// ReactDOM.findDOMNode (see vite.config.mts), so the phone menu and every other transition failed on React Router pages.
const buildDir = path.join(__dirname, '../../../build-router');
const marker = 'Argument appears to not be a ReactComponent';

function filesWithMarker(directory, extension) {
	/* eslint-disable node/no-sync */
	return fs.readdirSync(directory, {recursive: true})
		.filter((file) => String(file).endsWith(extension))
		.filter((file) => fs.readFileSync(path.join(directory, String(file)), 'utf8').includes(marker));
	/* eslint-enable node/no-sync */
}

describe('findDOMNode replacement in the React Router build', () => {
	it('is part of the browser bundle', () => {
		expect(filesWithMarker(path.join(buildDir, 'client'), '.js')).to.have.length.above(0);
	});

	it('is not part of the server build, which shares react-dom with Express', () => {
		expect(filesWithMarker(path.join(buildDir, 'server'), '.mjs')).to.have.lengthOf(0);
	});
});
