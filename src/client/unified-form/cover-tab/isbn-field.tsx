import {ISBNDispatchProps, ISBNProps, RInputEvent} from '../interface/type';
import {debouncedUpdateISBNValue, updateISBNType} from './action';
import Immutable from 'immutable';
import NameField from '../../entity-editor/common/name-field';
import React from 'react';
import {connect} from 'react-redux';


export function ISBNField(props:ISBNProps) {
	const {value, type, onChange} = props;
	return (
		<div>
			<NameField
				defaultValue={value}
				empty={value.length === 0}
				error={Boolean(!type && value)}
				label="ISBN"
				tooltipText="ISBN either 13 or 10"
				onChange={onChange}
			/>
		</div>);
}

function mapStateToProps(rootState:Immutable.Map<any, any>):Record<string, any> {
	return {
		type: rootState.getIn(['ISBN', 'type']),
		value: rootState.getIn(['ISBN', 'value'])
	};
}

function mapDispatchToProps(dispatch):ISBNDispatchProps {
	function onChange(event:RInputEvent) {
		const {value} = event.target;
		const isbn10rgx = new
		RegExp('^(?:ISBN(?:-10)?:?●)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-●]){3})[-●0-9X]{13}$)[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9X]$');
		const isbn13rgx = new
		RegExp('^(?:ISBN(?:-13)?:?●)?(?=[0-9]{13}$|(?=(?:[0-9]+[-●]){4})[-●0-9]{17}$)97[89][-●]?[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9]$');
		if (isbn10rgx.test(value)) {
			dispatch(updateISBNType(10));
		}
		else if (isbn13rgx.test(value)) {
			dispatch(updateISBNType(9));
		}
		else {
			dispatch(updateISBNType(null));
		}
		dispatch(debouncedUpdateISBNValue(value));
	}
	return {
		onChange
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ISBNField);
