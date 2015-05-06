var React = require('react');
var EditForm = React.createFactory(require('../../components/forms/edition.jsx'));
var props = JSON.parse(document.getElementById('props').innerHTML);

props.identifierTypes = [
	{
		label: 'MusicBrainz Release',
		id: 1,
		detectionRegex: "musicbrainz\.org\/release\/([a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12})",
		validationRegex: "^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$"
	},
	{
		label: 'MusicBrainz Artist',
		id: 2,
		detectionRegex: "musicbrainz\.org\/artist\/([a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12})",
		validationRegex: "^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$"
	},
	{
		label: 'MusicBrainz Work',
		id: 3,
		detectionRegex: "musicbrainz\.org\/work\/([a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12})",
		validationRegex: "^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$"
	},
	{
		label: 'Wikidata',
		id: 4,
		detectionRegex: /wikidata\.org\/wiki\/(Q\d+)/,
		validationRegex: /^Q\d+$/
	},
];

var regexes = [
	"wikipedia\.org\/wiki\/(\w+)",
	"wikidata.org/wiki/(Q\d+)",
	"amazon.*?\/(?:.*?\/)*?(B\d{2}\w{7}|\d{9}[X\d])",
	"((?:\d-?){9}[X\d])",
	"((?:\d-?){12}[X\d])",
	"openlibrary\.org\/books\/(OL\d+?M)",
	"((?:http:\/\/|https:\/\/)?(?:\w*\.)?\w+?\.\w+?\/.+)$",
];


React.render(EditForm(props), document.getElementById('editionForm'));
