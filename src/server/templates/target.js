import favicon from './favicon';


export default ({title, markup, page, props, script}) => `
	  <!DOCTYPE html>
	  <html>
		<head>
		  <title>${title ? `'${title} – BookBrainz'` :
		     'BookBrainz – The Open Book Database'}</title>
		  <link rel="stylesheet" href='/stylesheets/style.css' />
		  <link rel="stylesheet" href='/stylesheets/react-virtualized.css' />
		  <link rel="stylesheet"
		    href='/stylesheets/react-virtualized-select.css' />
		  <meta name='viewport' content='//react-virtualized.css' />
		  ${favicon}
		</head>

		<body>
		  <div id="target">${markup}</div>
		  <script src='/js/bundle.js' />
		  ${page ?
		    `<script id='page' type='application/json' >${page}</script>` : ''}
		  ${props && script ?
		    `<script id='props' type='application/json'> ${props}</script>
			<script src='${script} />` : ''}
		</body>
	  </html>
	`;
