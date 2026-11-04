/* eslint-disable import/no-commonjs */
module.exports = {
	overrides: [{
		files: ['**/*.ts', '**/*.tsx'],
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
		'import/no-internal-modules': 'off',
		'import/no-unresolved': 'off',
		'no-restricted-imports': ['error', {
			paths: ['bookbrainz-data', 'express'],
			patterns: ['**/src/server/**', '**/src/api/**', '**/src/common/helpers/search',
				'**/src/common/helpers/config', '**/src/common/helpers/utils']
		}],
		'node/no-missing-import': 'off'
	}
};
