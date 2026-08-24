/** @type {import('i18next-cli').I18nextToolkitConfig} */
export default {
	extract: {
		defaultNS: false,
		functions: ['t', '*.t', 'translate'],
		input: ['src/**/*.{js,jsx,ts,tsx}'],
		keySeparator: '.',
		nsSeparator: false,
		output: 'public/locales/{{language}}/translation.json',
		removeUnusedKeys: false,
		sort: true
	},
	locales: ['en']
};
