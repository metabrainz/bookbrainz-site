import Relationship, {RelationshipType} from './relationship';
import {OptionProps} from 'react-select/src/components/Option';
import React from 'react';
import {SingleValueProps} from 'react-select/src/components/SingleValue';
import {components} from 'react-select';


const RelationshipSelect = (props:OptionProps<RelationshipType, any>|SingleValueProps<RelationshipType>) => {
	const parentContainer = props.innerProps ? components.Option : components.SingleValue;
	return <Relationship Parent={parentContainer} {...props} {...props.data}/>;
};

export default RelationshipSelect;
