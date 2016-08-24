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

import {Button, Input} from 'react-bootstrap';

import React from 'react';
import ValidationLabel from './validation-label';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';
import {updateSortNameField} from './actions';

const KEYSTROKE_DEBOUNCE_TIME = 250;

/**
 * Removes all period characters (dots) from the input string, returning a new
 * string.
 *
 * @param {String} name the input string to strip
 * @returns {String} the string with dots removed
 */
function stripDot(name) {
	return name.replace(/\./g, '');
}

function makeSortName(name) {
	const articles = ['a', 'an', 'the', 'los', 'las', 'el', 'la'];
	const suffixes = [
		'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi',
		'xii', 'xiii', 'xiv', 'xv', 'jr', 'junior', 'sr', 'senior', 'phd', 'md',
		'dmd', 'dds', 'esq'
	];

	// Remove leading and trailing spaces, and return a blank sort name if
	// the string is empty
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

	// From here on, it is assumed that the sort name is for a person
	// Split suffixes
	const isWordSuffix =
		words.map((word) => suffixes.includes(stripDot(word).toLowerCase()));
	const lastSuffix = isWordSuffix.lastIndexOf(false) + 1;

	// Test this to check that splice will not have a 0 deleteCount
	const suffixWords = (
		lastSuffix < words.length ?
			words.splice(lastSuffix) :
			[]
	);

	// Rearrange names to (last name, other names)
	const INDEX_BEFORE_END = -1;

	let lastName = words.splice(INDEX_BEFORE_END);
	if (suffixWords.length > 0) {
		lastName += ` ${suffixWords.join(' ')}`;
	}

	return `${lastName}, ${words.join(' ')}`;
}

/**
 * Presentational component. Renders the sort name field for the alias section
 * of entity editing forms.
 *
 * @returns {Object} a React component containing the rendered input
 */
function SortNameField({
	empty,
	error,
	onChange,
	storedNameValue
}) {
	let input;

	function handleGuessClick() {
		input.getInputDOMNode().value = makeSortName(storedNameValue);
	}

	const label = (
		<ValidationLabel
			empty={empty}
			error={error}
		>
			Sort Name
		</ValidationLabel>
	);

	const guessButton = (
		<Button
			bsStyle="primary"
			onClick={handleGuessClick}
		>
			Guess
		</Button>
	);

	return (
		<Input
			buttonAfter={guessButton}
			label={label}
			ref={(node) => { input = node; }}
			type="text"
			onChange={onChange}
		/>
	);
}
SortNameField.displayName = 'SortNameField';
SortNameField.propTypes = {
	empty: React.PropTypes.bool,
	error: React.PropTypes.bool,
	storedNameValue: React.PropTypes.string,
	onChange: React.PropTypes.func
};

function isEmpty(state) {
	return !(state.get('nameValue') || state.get('sortNameValue'));
}

function isError(state) {
	return !(state.get('sortNameValue'));
}

function mapStateToProps(state) {
	return {
		empty: isEmpty(state),
		error: isError(state),
		storedNameValue: state.get('nameValue')
	};
}

function mapDispatchToProps(dispatch) {
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);
	return {
		onChange: (event) => debouncedDispatch(
			updateSortNameField(event.target.value)
		)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SortNameField);
