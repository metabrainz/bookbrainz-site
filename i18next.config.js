/** @type {import('i18next-cli').I18nextToolkitConfig} */
export default {
	extract: {
		defaultNS: 'common',
		input: ['src/**/*.{js,jsx,ts,tsx}'],
		keySeparator: false,
		nsSeparator: ':',
		output: 'public/locales/{{language}}/{{namespace}}.json',
		removeUnusedKeys: false,
		sort: true
	},
	locales: ['en']
};
