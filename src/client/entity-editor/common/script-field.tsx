import * as React from 'react';
import {Form, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {RecentlyUsed} from '../../unified-form/common/recently-used';
import Select from 'react-select';
import ValidationLabel from './validation-label';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';
import {isNumber} from 'lodash';


type Props = {
	empty?: boolean,
	error?: boolean,
	tooltipText?: string,
	onChange?: (selectedOption: any) => void,
	[propName: string]: any
};

function ScriptField({
	empty,
	error,
	tooltipText,
	onChange,
	...rest
}: Props) {
	const label =
		<ValidationLabel empty={empty} error={error}>Script</ValidationLabel>
	;
	const tooltip = <Tooltip id="script-tooltip">{tooltipText}</Tooltip>;
	const {options, ...selectRest} = rest;

	const recentItems = RecentlyUsed.getItems('scripts');
	const frequentlyUsed = options.filter((script) => isNumber(script.frequency) && script.frequency >= 3);
	const other = options.filter((script) => !isNumber(script.frequency) || script.frequency < 3);

	const groupedOptions = [
		{
			label: 'Recently Used',
			options: recentItems.map((item) => ({label: item.name, value: item.id}))
		},
		{
			label: 'Frequently Used',
			options: frequentlyUsed
		},
		{
			label: 'Other',
			options: other
		}
	].filter((group) => group.options.length > 0);

	const handleChange = (selectedOption) => {
		if (selectedOption && selectedOption.value && selectedOption.label) {
			RecentlyUsed.addItem('scripts', {id: selectedOption.value, name: selectedOption.label});
		}
		if (onChange) {
			onChange(selectedOption);
		}
	};

	return (
		<Form.Group>
			<Form.Label>
				{label}
				{tooltipText &&
					<OverlayTrigger delay={50} overlay={tooltip}>
						<FontAwesomeIcon
							className="margin-left-0-5"
							icon={faQuestionCircle}
						/>
					</OverlayTrigger>
				}
			</Form.Label>
			<Select
				isClearable
				classNamePrefix="react-select"
				options={groupedOptions}
				placeholder="Select script…"
				{...selectRest}
				// eslint-disable-next-line react/jsx-no-bind
				onChange={handleChange}
			/>
		</Form.Group>
	);
}
ScriptField.displayName = 'ScriptField';
ScriptField.defaultProps = {
	empty: false,
	error: false,
	onChange: null,
	tooltipText: null
};

export default ScriptField;
