import {ISBNDispatchProps, ISBNProps, ISBNStateProps, RInputEvent, State, dispatchResultProps} from '../interface/type';
import {addOtherISBN, removeIdentifierRow} from '../../entity-editor/identifier-editor/actions';
import {debouncedUpdateISBNValue, updateAutoISBN, updateISBNType} from './action';
import {isbn10To13, isbn13To10} from '../../../common/helpers/utils';
import {FormCheck} from 'react-bootstrap';
import NameField from '../../entity-editor/common/name-field';
import React from 'react';
import {connect} from 'react-redux';


export function ISBNField(props:ISBNProps) {
	const {value, type, onChange, autoISBN, onAutoISBNChange} = props;
	const onChangeHandler = React.useCallback((event:RInputEvent) => onChange(event.target.value, autoISBN), [onChange, autoISBN]);
	const onAutoISBNChangeHandler = React.useCallback((event:RInputEvent) => {
		onAutoISBNChange(event.target.checked);
		onChange(value, event.target.checked);
	}, [onAutoISBNChange, onChange, value]);
	let checkboxLabel = 'Automatically add ISBN';
	if (type) {
		checkboxLabel += type === 10 ? `13 (${isbn10To13(value)})` : `10 (${isbn13To10(value)})`;
	}
	else {
		checkboxLabel += '?';
	}
	return (
		<div>
			<NameField
				defaultValue={value}
				empty={value.length === 0}
				error={Boolean(!type && value)}
				label="ISBN"
				tooltipText="The International Standard Book Number (ISBN) is a commercial book identifier,
				composed of 10 or 13 numbers, often also used as the barcode."
				onChange={onChangeHandler}
			/>
			<FormCheck
				defaultChecked={autoISBN}
				disabled={!type}
				id="autoisbn-check"
				label={checkboxLabel}
				type="checkbox"
				onChange={onAutoISBNChangeHandler}
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
	let autoAddedISBN:dispatchResultProps|null;
	function onChange(value:string, autoISBN = false) {
		const isbn10rgx = new
		RegExp('^(?:ISBN(?:-10)?:?●)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-●]){3})[-●0-9X]{13}$)[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9X]$');
		const isbn13rgx = new
		RegExp('^(?:ISBN(?:-13)?:?●)?(?=[0-9]{13}$|(?=(?:[0-9]+[-●]){4})[-●0-9]{17}$)97[89][-●]?[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9]$');
		const otherISBN = {type: null, value: ''};
		// typeID for ISBN10: 10, ISBN13: 9
		let type = null;
		if (isbn10rgx.test(value)) {
			type = 10;
			if (autoISBN) {
				otherISBN.type = 9;
				otherISBN.value = isbn10To13(value);
			}
		}
		else if (isbn13rgx.test(value)) {
			type = 9;
			if (autoISBN) {
				otherISBN.type = 10;
				otherISBN.value = isbn13To10(value);
			}
		}
		dispatch(updateISBNType(type));
		if (autoISBN && otherISBN.type) {
			 autoAddedISBN = dispatch(addOtherISBN(otherISBN.type, otherISBN.value));
		}
		dispatch(debouncedUpdateISBNValue(value));
	}
	return {
		onAutoISBNChange: (checked:boolean) => {
			dispatch(updateAutoISBN(checked));
			if (autoAddedISBN) {
				dispatch(removeIdentifierRow(autoAddedISBN.payload.rowId));
				autoAddedISBN = null;
			}
		},
		onChange
	};
}

export default connect<ISBNStateProps, ISBNDispatchProps>(mapStateToProps, mapDispatchToProps)(ISBNField);
