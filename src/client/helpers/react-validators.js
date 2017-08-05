import React from 'react';


export const entityProperty = React.PropTypes.shape({
	bbid: React.PropTypes.string,
	defaultAlias: React.PropTypes.shape({
		name: React.PropTypes.string
	})
});

export const labeledProperty = React.PropTypes.shape({
	id: React.PropTypes.number,
	label: React.PropTypes.string
});

export const namedProperty = React.PropTypes.shape({
	id: React.PropTypes.number,
	name: React.PropTypes.string
});
