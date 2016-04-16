const React = require('react');

module.exports = {
	entityProperty: React.PropTypes.shape({
		bbid: React.PropTypes.string,
		defaultAlias: React.PropTypes.shape({
			name: React.PropTypes.string
		})
	}),
	labeledProperty: React.PropTypes.shape({
		id: React.PropTypes.number,
		label: React.PropTypes.string
	}),
	namedProperty: React.PropTypes.shape({
		id: React.PropTypes.number,
		name: React.PropTypes.string
	})
};
