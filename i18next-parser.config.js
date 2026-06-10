export default {
	defaultNamespace: 'common',
	input: ['src/**/*.{js,jsx,ts,tsx}'],
	keepRemoved: true,
	keySeparator: false,
	locales: ['en'],
	namespaceSeparator: ':',
	output: 'public/locales/$LOCALE/$NAMESPACE.json',
	sort: true
};
