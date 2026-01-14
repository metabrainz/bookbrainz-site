/*
 * Copyright (C) 2016  Ben Ockmore
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import * as React from 'react';
import {Button, Form, InputGroup, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import ValidationLabel from '../common/validation-label';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';
import {makeSortName} from '../../unified-form/common/guess-case-util';

type onChangeParamType = {
	target: {
		value: string
	}
};

type Props = {
	empty?: boolean,
	error?: boolean,
	languageCode?: string,
	onChange?: (value: onChangeParamType) => unknown,
	storedNameValue: string
};

/**
 * Presentational component. This component renders a plain text input which
 * incorporates a 'Guess Sort Name' button, and a ValidationLabel for a field
 * labelled 'Sort Name'. When clicked, the 'Guess Sort Name' button uses the
 * name value passed to the component to guess an appropriate sort name.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.error - Passed to the ValidationLabel within the
 *        component to indicate a validation error.
 * @param {boolean} props.empty - Passed to the ValidationLabel within the
 *        component to indicate that the field is empty.
 * @param {Function} props.onChange - Function to be called when the value in
 *        the wrapped input changes.
 * @param {string} props.storedNameValue - The name value to be used to
 *        generate the sort name when the 'Guess Sort Name' button is clicked.
 * @param {string} props.languageCode - Optional ISO language code (e.g., 'en', 'de', 'fr')
 *        used to apply language-specific sort name rules.
 * @returns {Object} a React component containing the rendered input
 */
function SortNameField({
	empty,
	error,
	languageCode,
	onChange,
	storedNameValue,
	...rest
}: Props) {
	let input;

	function handleGuessClick() {
		const generatedSortName = makeSortName(storedNameValue, languageCode);
		if (input) {
			input.value = generatedSortName;
		}

		if (onChange) {
			onChange({target: {value: generatedSortName}});
		}
	}

	function handleCopyClick() {
		if (input) {
			input.value = storedNameValue;
		}

		if (onChange) {
			onChange({target: {value: storedNameValue}});
		}
	}

	const label = (
		<ValidationLabel empty={empty} error={error}>
			Sort Name
		</ValidationLabel>
	);

	/* eslint-disable react/jsx-no-bind */
	const guessButton =
		<Button variant="primary" onClick={handleGuessClick}>Guess</Button>;

	const copyButton =
		<Button className="ml-1" variant="primary" onClick={handleCopyClick}>Copy</Button>;
	/* eslint-enable react/jsx-no-bind */

	const tooltip = (
		<Tooltip>
			Alphabetical sorting name. Examples: &apos;Dickens, Charles&apos;, &apos;Christmas Carol, A&apos;.
			<br/>You can try to fill it automatically with the guess button
		</Tooltip>
	);

	return (
		<Form.Group>
			<Form.Label>
				{label}
				<OverlayTrigger delay={50} overlay={tooltip}>
					<FontAwesomeIcon className="margin-left-0-5" icon={faQuestionCircle}/>
				</OverlayTrigger>
			</Form.Label>
			<InputGroup>
				<Form.Control
					/* eslint-disable-next-line react/jsx-no-bind */
					ref={(node) => { input = node; }}
					type="text"
					onChange={onChange}
					{...rest}
				/>
				<InputGroup.Append>
					{guessButton}
					{copyButton}
				</InputGroup.Append>
			</InputGroup>
		</Form.Group>
	);
}
SortNameField.displayName = 'SortNameField';
SortNameField.defaultProps = {
	empty: false,
	error: false,
	onChange: null
};

export default SortNameField;
