import LinkedEntity from './linked-entity';
import {OptionProps} from 'react-select/src/components/Option';
import React from 'react';


const LinkedEntitySelect = (props:OptionProps<any, any>) => {
	const styles = props.getStyles('option', props);
	return <LinkedEntity {...(props.innerProps)} className="react-select__option" data={props.data} style={styles}/>;
};

export default LinkedEntitySelect;
