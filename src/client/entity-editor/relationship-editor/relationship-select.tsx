import {OptionProps, SingleValueProps, components} from 'react-select';
import Relationship, {RelationshipType} from './relationship';
import React from 'react';


const RelationshipSelect = (props:OptionProps<RelationshipType, any>|SingleValueProps<RelationshipType>) => {
	const parentContainer = props.innerProps ? components.Option : components.SingleValue;
	return <Relationship Parent={parentContainer} {...props} {...props.data}/>;
};

export default RelationshipSelect;
