/* eslint-disable import/no-commonjs */
/*
 * React Router app (built by Vite, not Babel). The packages it imports are ES modules
 * with `exports` maps and virtual modules that eslint-plugin-node / import cannot resolve.
 */
module.exports = {
	rules: {
		'import/no-internal-modules': 'off',
		'import/no-unresolved': 'off',
		'node/no-missing-import': 'off'
	}
};
