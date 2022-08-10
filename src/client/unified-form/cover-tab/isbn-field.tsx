import {ISBNDispatchProps, ISBNProps, ISBNStateProps, RInputEvent, State} from '../interface/type';
import {debouncedUpdateISBNValue, updateAutoISBN, updateISBNType} from './action';
import {FormCheck} from 'react-bootstrap';
import NameField from '../../entity-editor/common/name-field';
import React from 'react';
import {connect} from 'react-redux';


export function ISBNField(props:ISBNProps) {
	const {value, type, onChange, autoISBN, onAutoISBNChange} = props;
	return (
		<div>
			<NameField
				defaultValue={value}
				empty={value.length === 0}
				error={Boolean(!type && value)}
				label="ISBN"
				tooltipText="The International Standard Book Number (ISBN) is a commercial book identifier,
				composed of 10 or 13 numbers, often also used as the barcode."
				onChange={onChange}
			/>
			<FormCheck
				defaultChecked={autoISBN}
				disabled={!type}
				id="autoisbn-check"
				label="Automatically add other ISBN"
				type="checkbox"
				onChange={onAutoISBNChange}
			/>
		</div>);
}

function mapStateToProps(rootState:State):ISBNStateProps {
	return {
		autoISBN: rootState.get('autoISBN'),
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
		onAutoISBNChange: (event:RInputEvent) => dispatch(updateAutoISBN(event.target.checked)),
		onChange
	};
}

export default connect<ISBNStateProps, ISBNDispatchProps>(mapStateToProps, mapDispatchToProps)(ISBNField);
