import PropTypes from 'prop-types';


export const entityTypeProperty = PropTypes.oneOf([
	'author',
	'edition',
	'editionGroup',
	'publisher',
	'work'
]);

export const labeledProperty = PropTypes.shape({
	id: PropTypes.number,
	label: PropTypes.string
});

export const namedProperty = PropTypes.shape({
	id: PropTypes.number,
	name: PropTypes.string
});
