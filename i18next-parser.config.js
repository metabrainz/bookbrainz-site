export default {
	defaultNamespace: 'common',
	input: ['src/**/*.{js,jsx,ts,tsx}'],
	keepRemoved: true,
	keySeparator: false,
	lexers: {
		js: [{functions: ['t', 'translate'], lexer: 'JavascriptLexer'}],
		jsx: [{functions: ['t', 'translate'], lexer: 'JsxLexer'}],
		ts: [{functions: ['t', 'translate'], lexer: 'JavascriptLexer'}],
		tsx: [{functions: ['t', 'translate'], lexer: 'JsxLexer'}]
	},
	locales: ['en'],
	namespaceSeparator: ':',
	output: 'public/locales/$LOCALE/$NAMESPACE.json',
	sort: true
};
