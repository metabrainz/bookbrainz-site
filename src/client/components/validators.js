const React = require('react');

module.exports = {
	labeledProperty: React.PropTypes.shape({
		id: React.PropTypes.number,
		label: React.PropTypes.string
	})
};
