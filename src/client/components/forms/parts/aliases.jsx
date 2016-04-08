/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
 *               2015  Ohm Patel
 *               2015  Ian Sanders
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

const React = require('react');
const Icon = require('react-fontawesome');

const Input = require('react-bootstrap').Input;
const Button = require('react-bootstrap').Button;
const Select = require('../../input/select2.jsx');

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

const AliasRow = React.createClass({
	displayName: 'aliasRowComponent',
	propTypes: {
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
	},
	getValue() {
		'use strict';

		return {
			id: parseInt(this.id.getValue(), 10),
			name: this.name.getValue(),
			sortName: this.sortName.getValue(),
			languageId: parseInt(this.languageId.getValue(), 10) || null,
			primary: this.primary.getChecked(),
			default: this.default.getChecked()
		};
	},
	validationState() {
		'use strict';

		if (this.props.name || this.props.sortName || this.props.default ||
				this.props.languageId || !this.props.primary) {
			if (this.props.name && this.props.sortName) {
				return 'success';
			}

			return 'error';
		}

		return null;
	},
	getValid() {
		'use strict';

		return Boolean(
			this.name.getValue() && this.sortName.getValue()
		);
	},
	guessNames() {
		'use strict';
		const name = this.name.refs.input;
		const sortName = this.sortName.refs.input;

		sortName.value = makeSortName(name.value);
	},
	render() {
		'use strict';

		const guessSortNameButton = (
			<Button
				bsStyle="link"
				title="Guess Sort Name"
				onClick={this.guessNames}
			>
				<Icon name="magic"/>
			</Button>
		);

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
						defaultValue={this.props.sortName}
						ref={(ref) => this.sortName = ref}
						type="text"
						wrapperClassName="col-md-11"
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
});

const AliasList = React.createClass({
	displayName: 'aliasListComponent',
	propTypes: {
		aliases: React.PropTypes.array,
		nextClick: React.PropTypes.func,
		visible: React.PropTypes.bool
	},
	getInitialState() {
		'use strict';

		const existing = this.props.aliases || [];
		existing.push({
			name: '',
			sortName: '',
			languageId: null,
			primary: true,
			default: false
		});

		existing.forEach((alias, i) => {
			alias.key = i;
		});

		if (existing.length === 1) {
			// Set default alias as first row in "create" form.
			existing[0].default = true;
		}

		return {
			aliases: existing,
			rowsSpawned: existing.length
		};
	},
	getValue() {
		'use strict';

		const aliases = [];

		for (let i = 0; i < this.state.aliases.length; i++) {
			aliases.push(this.refs[i].getValue());
		}

		return aliases;
	},
	stateUpdateNeeded(changedRowIndex) {
		'use strict';

		const updatedAlias = this.refs[changedRowIndex].getValue();
		const existingAlias = this.state.aliases[changedRowIndex];

		const aliasSortNameJustSetOrUnset = (
			!existingAlias.sortName && updatedAlias.sortName ||
			existingAlias.sortName && !updatedAlias.sortName
		);

		const aliasNameJustSetOrUnset = (
			!existingAlias.name && updatedAlias.name ||
			existingAlias.name && !updatedAlias.name
		);

		const aliasLanguageJustSetOrUnset = (
			!existingAlias.languageId && updatedAlias.languageId ||
			existingAlias.languageId && !updatedAlias.languageId
		);

		const lastAliasModified =
			changedRowIndex === this.state.aliases.length - 1;

		const defaultJustCheckedOrUnchecked = (
			!existingAlias.default && updatedAlias.default ||
			updatedAlias.default && !existingAlias.default
		);

		const primaryJustCheckedOrUnchecked = (
			!existingAlias.primary && updatedAlias.primary ||
			updatedAlias.primary && !existingAlias.primary
		);

		return Boolean(
			aliasSortNameJustSetOrUnset || aliasNameJustSetOrUnset ||
			aliasLanguageJustSetOrUnset || lastAliasModified &&
			(defaultJustCheckedOrUnchecked || primaryJustCheckedOrUnchecked)
		);
	},
	handleChange(changedRowIndex) {
		'use strict';

		if (this.stateUpdateNeeded(changedRowIndex)) {
			const updatedAliases = this.getValue();

			updatedAliases.forEach((alias, idx) => {
				alias.key = this.state.aliases[idx].key;
			});

			let rowsSpawned = this.state.rowsSpawned;
			if (changedRowIndex === this.state.aliases.length - 1) {
				updatedAliases.push({
					name: '',
					sortName: '',
					languageId: null,
					primary: true,
					default: false,
					key: rowsSpawned++
				});
			}

			this.setState({
				aliases: updatedAliases,
				rowsSpawned
			});
		}
	},
	valid() {
		'use strict';

		let defaultSet = false;
		const numRows = this.state.aliases.length - 1;

		for (let i = 0; i < numRows; i++) {
			const alias = this.refs[i].getValue();
			const rowInvalid = this.refs[i].getValid() === false;
			if (rowInvalid) {
				return false;
			}
			else if (!defaultSet) {
				defaultSet = alias.default;
			}
		}

		return defaultSet || numRows === 0;
	},
	handleRemove(index) {
		'use strict';

		const updatedAliases = this.getValue();

		if (index !== this.state.aliases.length - 1) {
			updatedAliases.forEach((alias, idx) => {
				alias.key = this.state.aliases[idx].key;
			});

			updatedAliases.splice(index, 1);

			this.setState({
				aliases: updatedAliases
			});
		}
	},
	render() {
		'use strict';

		const self = this;
		const rows = this.state.aliases.map((alias, index) => (
			<AliasRow
				aliasId={alias.id}
				default={alias.default}
				key={alias.key}
				languageId={alias.languageId}
				languages={self.props.languages}
				name={alias.name}
				primary={alias.primary}
				ref={index}
				removeHidden={index === self.state.aliases.length - 1}
				sortName={alias.sortName}
				onChange={self.handleChange.bind(null, index)}
				onRemove={self.handleRemove.bind(null, index)}
			/>
		));

		return (
			<div className={this.props.visible === false ? 'hidden' : ''}>
				<h2>Add Aliases</h2>
				<p className="lead">Add some aliases to the entity.</p>
				<div className="form-horizontal">
					<div className="row margin-top-1">
						<label className="col-md-3">Name</label>
						<label className="col-md-3">Sort Name</label>
						<label className="col-md-3">Language</label>
						<label className="col-md-1">Primary</label>
						<label className="col-md-1">Default</label>
					</div>
					{rows}
				</div>

				<nav className="margin-top-1">
					<ul className="pager">
						<li className="next">
							<a
								href="#"
								onClick={this.props.nextClick}
							>
								Next
								<Icon
									aria-hidden="true"
									name="angle-double-right"
								/>
							</a>
						</li>
					</ul>
				</nav>
			</div>
		);
	}
});

module.exports = AliasList;
