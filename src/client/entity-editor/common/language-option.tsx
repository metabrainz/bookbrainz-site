import {OptionProps} from 'react-select';
import React from 'react';


const Option = (props:OptionProps) => {
	const styles:any = props.getStyles('option', {...props, isSelected: false});
	return (
		<div
			className="react-select__option"
			id={props.innerProps.id}
			style={styles}
			tabIndex={props.innerProps.tabIndex}
			onClick={props.innerProps.onClick as any}
		>
			{props.children}
		</div>
	);
};
export default Option;
