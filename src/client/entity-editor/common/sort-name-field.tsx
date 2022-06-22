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

/**
 * Removes all period characters (dots) from the input string, returning a new
 * string.
 *
 * @param {String} name the input string to strip
 * @returns {String} the string with dots removed
 */
function stripDot(name: string): string {
	return name.replace(/\./g, '');
}

function makeSortName(name: string): string {
	const articles = ['a', 'an', 'the', 'los', 'las', 'el', 'la'];
	const suffixes = [
		'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi',
		'xii', 'xiii', 'xiv', 'xv', 'jr', 'junior', 'sr', 'senior', 'phd', 'md',
		'dmd', 'dds', 'esq'
	];

	/*
	 * Remove leading and trailing spaces, and return a blank sort name if
	 * the string is empty
	 */
	const trimmedName = name.trim();
	if (trimmedName.length === 0) {
		return '';
	}

	const words = trimmedName.replace(/,/g, '').split(' ');

	// If there's only one word, simply copy the name as the sort name
	if (words.length === 1) {
		return trimmedName;
	}

	// First, check if sort name is for collective, by detecting article
	const firstWord = stripDot(words[0]);
	const firstWordIsArticle = articles.includes(firstWord.toLowerCase());
	if (firstWordIsArticle) {
		// The Collection of Stories --> Collection of Stories, The
		return `${words.slice(1).join(' ')}, ${firstWord}`;
	}

	/*
	 * From here on, it is assumed that the sort name is for a person
	 * Split suffixes
	 */
	const isWordSuffix =
		words.map((word) => suffixes.includes(stripDot(word).toLowerCase()));
	const lastSuffix = isWordSuffix.lastIndexOf(false) + 1;

	// Test this to check that splice will not have a 0 deleteCount
	const suffixWords =
		lastSuffix < words.length ? words.splice(lastSuffix) : [];

	// Rearrange names to (last name, other names)
	const INDEX_BEFORE_END = -1;

	let [lastName] = words.splice(INDEX_BEFORE_END);
	if (suffixWords.length > 0) {
		lastName += ` ${suffixWords.join(' ')}`;
	}

	return `${lastName}, ${words.join(' ')}`;
}

type onChangeParamType = {
	target: {
		value: string
	}
};

type Props = {
	empty?: boolean,
	error?: boolean,
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
 * @returns {Object} a React component containing the rendered input
 */
function SortNameField({
	empty,
	error,
	onChange,
	storedNameValue,
	...rest
}: Props) {
	let input;

	function handleGuessClick() {
		const generatedSortName = makeSortName(storedNameValue);
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
