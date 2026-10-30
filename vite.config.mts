/* eslint-disable import/no-unresolved, node/no-missing-import */
import {type Plugin, defineConfig, transformWithEsbuild} from 'vite';
import {fileURLToPath} from 'node:url';
import {reactRouter} from '@react-router/dev/vite';

/*
 * Compile the JSX in src/ and app/ ourselves, with the classic transform (React.createElement) like Babel's
 * preset-react does for the Express pages today:
 * - much of src/ has JSX in plain .js files, which Vite does not parse;
 * - React Router's Vite plugin turns on the automatic runtime for everything else, and with that React 19 no
 *   longer applies the defaultProps that third-party function components (react-fontawesome, react-bootstrap...)
 *   still rely on.
 */
const classicJsx = {
	enforce: 'pre' as const,
	name: 'classic-jsx',
	transform(code: string, id: string) {
		const file = id.split('?')[0];
		if (!(/\/(src|app)\/.*\.(js|tsx)$/).test(file)) {
			return null;
		}
		return transformWithEsbuild(code, file, {jsx: 'transform', loader: file.endsWith('.tsx') ? 'tsx' : 'jsx'});
	}
};

/*
 * React 19 removed ReactDOM.findDOMNode, which react-bootstrap's transitions (react-transition-group) still call
 * (see src/client/helpers/find-dom-node.js). In the browser bundle every import of `react-dom` therefore goes to
 * react-dom-compat.js, the real react-dom plus findDOMNode, and `react-dom-original` is the real react-dom itself.
 * This is a plugin and not `resolve.alias`: an alias applies to every environment, and on the server `react-dom`
 * has to stay the one package that Express and the server build share.
 */
const reactDomCompat: Plugin = {
	enforce: 'pre',
	name: 'react-dom-compat',
	resolveId(source) {
		if (this.environment.name !== 'client') {
			return null;
		}
		if (source === 'react-dom') {
			return here('./src/client/helpers/react-dom-compat.js');
		}
		if (source === 'react-dom-original') {
			return here('./node_modules/react-dom/index.js');
		}
		return null;
	}
};

function here(relative: string) {
	return fileURLToPath(new URL(relative, import.meta.url));
}

// @ts-expect-error Vite's types do not accept the source map that transformWithEsbuild returns (classicJsx above)
export default defineConfig(({command}) => ({
	environments: {
		ssr: {
			build: {
				rollupOptions: {
					// .mjs so that Node treats the build as ES modules without a package.json next to it
					output: {chunkFileNames: 'assets/[name]-[hash].mjs'}
				}
			}
		}
	},
	plugins: [reactDomCompat, classicJsx, reactRouter()],
	resolve: {
		// lodash is CommonJS and Node's ESM loader / Vite's module runner cannot do named imports from it
		// (`import {isNil} from 'lodash'`); lodash-es has the same functions as an ES module
		alias: [{find: /^lodash$/, replacement: 'lodash-es'}]
	},
	ssr: {
		// In the production build Node's ESM loader would load the dependencies and cannot do named imports
		// from CommonJS packages (`import {isNil} from 'lodash'`), so bundle them into the server build, except
		// packages that only work as plain Node modules (they use __dirname, native bindings or load files at
		// runtime). In development Vite's module runner handles that interop itself and cannot evaluate
		// CommonJS sources, so nothing is bundled there.
		noExternal: command === 'build' ?
			[/^(?!isomorphic-dompurify|dompurify|jsdom|bookbrainz-data|pg|knex|redis|@elastic|@fortawesome|react(?:-dom)?(?:\/|$)|react-router|@react-router).*/] :
			// Development uses the same native Router and React modules as Express
			[]
	}
}));
