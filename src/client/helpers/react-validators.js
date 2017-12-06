import {ENTITY_TYPES} from '../helpers/entity';
import PropTypes from 'prop-types';


export const entityProperty = PropTypes.shape({
	bbid: PropTypes.string,
	defaultAlias: PropTypes.shape({
		name: PropTypes.string
	})
});

export const entityTypeProperty = PropTypes.oneOf(ENTITY_TYPES);

export const labeledProperty = PropTypes.shape({
	id: PropTypes.number,
	label: PropTypes.string
});

export const namedProperty = PropTypes.shape({
	id: PropTypes.number,
	name: PropTypes.string
});
