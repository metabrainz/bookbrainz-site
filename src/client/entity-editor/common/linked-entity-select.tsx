import LinkedEntity from './linked-entity';
import {OptionProps} from 'react-select';
import React from 'react';


const LinkedEntitySelect = (props:OptionProps<any, any>) => {
	const styles = props.getStyles('option', props);
	return <LinkedEntity {...props} className="react-select__option" style={styles}/>;
};

export default LinkedEntitySelect;
