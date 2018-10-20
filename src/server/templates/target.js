const favicon = `
	<link rel='apple-touch-icon' sizes='57x57'
		href='/images/icons/apple-touch-icon-57x57.png'/>
	<link rel='apple-touch-icon' sizes='60x60'
		href='/images/icons/apple-touch-icon-60x60.png'/>
	<link rel='apple-touch-icon' sizes='72x72'
		href='/images/icons/apple-touch-icon-72x72.png'/>
	<link rel='apple-touch-icon' sizes='76x76'
		href='/images/icons/apple-touch-icon-76x76.png'/>
	<link rel='apple-touch-icon' sizes='114x114'
		href='/images/icons/apple-touch-icon-114x114.png'/>
	<link rel='apple-touch-icon' sizes='120x120'
		href='/images/icons/apple-touch-icon-120x120.png'/>
	<link rel='apple-touch-icon' sizes='144x144'
		href='/images/icons/apple-touch-icon-144x144.png'/>
	<link rel='apple-touch-icon' sizes='152x152'
		href='/images/icons/apple-touch-icon-152x152.png'/>
	<link rel='apple-touch-icon' sizes='180x180'
		href='/images/icons/apple-touch-icon-180x180.png'/>
	<link rel='icon' type='image/png'
		href='/images/icons/favicon-32x32.png' sizes='32x32'/>
	<link rel='icon' type='image/png'
		href='/images/icons/android-chrome-192x192.png' sizes='192x192'/>
	<link rel='icon' type='image/png'
		href='/images/icons/favicon-96x96.png' sizes='96x96'/>
	<link rel='icon' type='image/png'
		href='/images/icons/favicon-16x16.png' sizes='16x16'/>
	<link rel='manifest' href='/manifest.json'/>

	<meta name='apple-mobile-web-app-title'
		content='BookBrainz'/>
	<meta name='application-name'
		content='BookBrainz'/>
	<meta name='msapplication-TileColor'
		content='#da532c'/>
	<meta name='msapplication-TileImage'
		content='/images/icons/mstile-144x144.png'/>
	<meta name='theme-color'
		content='#754e37'/>
		`;
export default ({
	title,
	markup,
	page,
	dev,
	props,
	script
}) => {
	const pageScript =
		`<script id='page' type='application/json'>${page}</script>`;
	return `
	<!DOCTYPE html>
	<html>
		<head>
			<title>${title ? `${title} – BookBrainz` :
		'BookBrainz – The Open Book Database'}</title>
		${!dev ?
		`<link rel='stylesheet' href='/stylesheets/style.css' />
			<link rel='stylesheet' href='/stylesheets/react-virtualized.css' />
			<link rel='stylesheet'
				href='/stylesheets/react-virtualized-select.css' />` : ''}
			<meta name='viewport'
				content='width=device-width, initial-scale=1' />
			${favicon}
		</head>

		<body>
			<div id='target'>${markup}</div>
			<script src='/js/bundle.js'></script>
			${page ? pageScript : ''}
			${props && script &&
				`<script id='props' type='application/json'> ${props}</script>
				<script src='${script}'></script>`}
		</body>
	  </html>
	`;
};
