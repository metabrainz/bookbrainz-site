const React = require('react');

module.exports = {
	identifierType: React.PropTypes.shape({
		identifier_type_id: React.PropTypes.number,
		label: React.PropTypes.string
	}),
	publicationType: React.PropTypes.shape({
		id: React.PropTypes.number,
		label: React.PropTypes.string
	}),
	publisherType: React.PropTypes.shape({
		id: React.PropTypes.number,
		label: React.PropTypes.string
	}),
	relationshipType: React.PropTypes.shape({
		id: React.PropTypes.number,
		label: React.PropTypes.string
	}),
	workType: React.PropTypes.shape({
		id: React.PropTypes.number,
		label: React.PropTypes.string
	})
};
