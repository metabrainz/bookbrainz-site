/* eslint-disable import/no-commonjs */
/*
 * The backend knows nothing about the web: no requests, no responses, no React and no router. It is called by the
 * Express handlers and by the React Router loaders alike.
 */
module.exports = {
	overrides: [{
		files: ['**/*.ts'],
		parserOptions: {project: './app/tsconfig.json'},
		rules: {
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unsafe-argument': 'error',
			'@typescript-eslint/no-unsafe-assignment': 'error',
			'@typescript-eslint/no-unsafe-call': 'error',
			'@typescript-eslint/no-unsafe-member-access': 'error',
			'@typescript-eslint/no-unsafe-return': 'error'
		}
	}],
	rules: {
		'no-restricted-imports': ['error', {
			paths: [
				{message: 'The backend must not depend on the web layer.', name: 'express'},
				{message: 'The backend must not depend on React.', name: 'react'},
				{message: 'The backend must not depend on React.', name: 'react-dom'},
				{message: 'The backend must not depend on the router.', name: 'react-router'}
			],
			patterns: ['**/app/**', '**/client/**']
		}]
	}
};
