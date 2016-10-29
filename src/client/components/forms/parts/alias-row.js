/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
 *               2015       Ohm Patel
 *               2015       Ian Sanders
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

const Icon = require('react-fontawesome');
const React = require('react');

const Input = require('react-bootstrap').Input;
const Button = require('react-bootstrap').Button;

const Select = require('../../input/select2');

function stripDot(name) {
	'use strict';

	return name.replace(/\./g, '');
}

function makeSortName(name) {
	'use strict';

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

	const words = trimmedName.replace(/\,/g, '').split(' ');

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
		lastSuffix < words.length ? words.splice(lastSuffix) : []
	);

	// Rearrange names to (last name, other names)
	const INDEX_BEFORE_END = -1;

	let lastName = words.splice(INDEX_BEFORE_END);
	if (suffixWords.length > 0) {
		lastName += ` ${suffixWords.join(' ')}`;
	}

	return `${lastName}, ${words.join(' ')}`;
}

class AliasRow extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			sortName: this.props.sortName || null
		};

		// React does not autobind non-React class methods
		this.handleGuessSortNameClick =
			this.handleGuessSortNameClick.bind(this);
		this.handleSortNameChange = this.handleSortNameChange.bind(this);
	}

	getValue() {
		return {
			id: parseInt(this.id.getValue(), 10),
			name: this.name.getValue(),
			sortName: this.sortName.getValue(),
			languageId: parseInt(this.languageId.getValue(), 10) || null,
			primary: this.primary.getChecked(),
			default: this.default.getChecked()
		};
	}

	validationState() {
		if (this.props.name || this.state.sortName || this.props.default ||
				this.props.languageId || !this.props.primary) {
			if (this.props.name && this.state.sortName) {
				return 'success';
			}

			return 'error';
		}

		return null;
	}

	getValid() {
		return Boolean(
			this.name.getValue() && this.sortName.getValue()
		);
	}

	handleGuessSortNameClick() {
		const name = this.name.getValue();

		this.setState({sortName: makeSortName(name)});
	}

	handleSortNameChange(event) {
		this.setState({sortName: event.target.value});
	}

	render() {
		const guessSortNameButton = (
			<Button
				bsStyle="link"
				title="Guess Sort Name"
				onClick={this.handleGuessSortNameClick}
			>
				<Icon name="magic"/>
			</Button>
		);

		const select2Options = {
			allowClear: true
		};

		return (
			<div
				className="row"
				onChange={this.props.onChange}
			>
				<Input
					defaultValue={this.props.aliasId}
					ref={(ref) => this.id = ref}
					type="hidden"
				/>
				<div className="col-md-3">
					<Input
						bsStyle={this.validationState()}
						defaultValue={this.props.name}
						ref={(ref) => this.name = ref}
						type="text"
						wrapperClassName="col-md-11"
					/> &nbsp;
				</div>
				<div className="col-md-3">
					<Input
						bsStyle={this.validationState()}
						buttonAfter={guessSortNameButton}
						ref={(ref) => this.sortName = ref}
						type="text"
						value={this.state.sortName}
						wrapperClassName="col-md-11"
						onChange={this.handleSortNameChange}
					/> &nbsp;
				</div>
				<div className="col-md-3">
					<Select
						noDefault
						bsStyle={this.validationState()}
						defaultValue={this.props.languageId}
						idAttribute="id"
						labelAttribute="name"
						options={this.props.languages}
						placeholder="Select alias language…"
						ref={(ref) => this.languageId = ref}
						select2Options={select2Options}
						wrapperClassName="col-md-11"
						onChange={this.props.onChange}
					/>
				</div>
				<div className="col-md-1">
					<Input
						defaultChecked={this.props.primary}
						label=" "
						ref={(ref) => this.primary = ref}
						type="checkbox"
						wrapperClassName="col-md-11"
					/>
				</div>
				<div className="col-md-1">
					<Input
						defaultChecked={this.props.default}
						label=" "
						name="default"
						ref={(ref) => this.default = ref}
						type="radio"
						wrapperClassName="col-md-11"
					/>
				</div>
				<div className="col-md-1 text-right">
					<Button
						bsStyle="danger"
						className={this.props.removeHidden ? 'hidden' : ''}
						onClick={this.props.onRemove}
					>
						<Icon name="times"/>
					</Button>
				</div>
			</div>
		);
	}
}

AliasRow.displayName = 'AliasRow';
AliasRow.propTypes = {
	aliasId: React.PropTypes.number,
	default: React.PropTypes.bool,
	languageId: React.PropTypes.number,
	languages: React.PropTypes.arrayOf(React.PropTypes.shape({
		id: React.PropTypes.number.isRequired,
		name: React.PropTypes.string.isRequired
	})).isRequired,
	name: React.PropTypes.string,
	primary: React.PropTypes.bool,
	removeHidden: React.PropTypes.bool,
	sortName: React.PropTypes.string,
	onChange: React.PropTypes.func,
	onRemove: React.PropTypes.func
};

module.exports = AliasRow;
