/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
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

const Input = require('react-bootstrap').Input;
const Button = require('react-bootstrap').Button;
const Select = require('../../input/select2.jsx');

const AliasRow = React.createClass({
	displayName: 'aliasRowComponent',
	propTypes: {
		aliasId: React.PropTypes.number,
		default: React.PropTypes.bool,
		language: React.PropTypes.number,
		languages: React.PropTypes.arrayOf(React.PropTypes.shape({
			id: React.PropTypes.number.isRequired,
			name: React.PropTypes.string.isRequired
		})).isRequired,
		name: React.PropTypes.string,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func,
		primary: React.PropTypes.bool,
		removeHidden: React.PropTypes.bool,
		sortName: React.PropTypes.string
	},
	getValue() {
		'use strict';

		return {
			id: parseInt(this.refs.id.getValue(), 10),
			name: this.refs.name.getValue(),
			sortName: this.refs.sortName.getValue(),
			language: parseInt(this.refs.language.getValue(), 10) || null,
			primary: this.refs.primary.getChecked(),
			default: this.refs.default.getChecked()
		};
	},
	validationState() {
		'use strict';

		if (this.props.name || this.props.sortName) {
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
			this.refs.name.getValue() && this.refs.sortName.getValue()
		);
	},
	guessNames() {
		'use strict';
		const name = this.refs.name.refs.input;
		const sortName = this.refs.sortName.refs.input;
		const articles = ['a', 'an', 'the'];
		const str = name.value.split(' ');
		const notFound = -1;
		let guessed = '';
		if (name.value.match(/^ *$/)) {
			guessed = '';
		}
		else if (articles.indexOf(str[0].toLowerCase()) > notFound) {
			guessed = (`${str.splice(1).join(' ')}, ${str[0]}`);
		}
		else {
			guessed = (`${str[str.length - 1]}, ${str.splice(0, str.length - 1).join(' ')}`);
		}
		sortName.value = guessed;
	},
	render() {
		'use strict';

		return (
			<div
				className="row"
				onChange={this.props.onChange}
			>
				<Input
					defaultValue={this.props.aliasId}
					ref="id"
					type="hidden"
				/>
				<div className="col-md-3">
					<Input
						bsStyle={this.validationState()}
						defaultValue={this.props.name}
						ref="name"
						type="text"
						wrapperClassName="col-md-11"
					/> &nbsp;
				</div>
				<div className="col-md-3">
					<Input
						bsStyle={this.validationState()}
						buttonAfter={<Button bsStyle="link" onClick={this.guessNames} title="attempt to guess sort name"><span className="fa fa-bolt"/></Button>}
						defaultValue={this.props.sortName}
						ref="sortName"
						type="text"
						wrapperClassName="col-md-11"
					/> &nbsp;
				</div>
				<div className="col-md-3">
					<Select
						bsStyle={this.validationState()}
						defaultValue={this.props.language}
						idAttribute="id"
						labelAttribute="name"
						noDefault
						onChange={this.props.onChange}
						options={this.props.languages}
						placeholder="Select alias language…"
						ref="language"
						wrapperClassName="col-md-11"
					/>
				</div>
				<div className="col-md-1">
					<Input
						defaultChecked={this.props.primary}
						label=" "
						ref="primary"
						type="checkbox"
						wrapperClassName="col-md-11"
					/>
				</div>
				<div className="col-md-1">
					<Input
						defaultChecked={this.props.default}
						label=" "
						name="default"
						ref="default"
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
						<span className="fa fa-times" />
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
			language: null,
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
			!existingAlias.language && updatedAlias.language ||
			existingAlias.language && !updatedAlias.language
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
					language: null,
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
		const numRows = this.state.aliases.length;

		for (let i = 0; i < numRows; i++) {
			const alias = this.refs[i].getValue();
			const rowInvalid = this.refs[i].getValid() === false;
			if (rowInvalid && numRows > 1 && (alias.name || alias.sortName)) {
				return false;
			}
			else if (!defaultSet) {
				defaultSet = alias.default;
			}
		}

		return defaultSet || numRows === 1;
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
				language={alias.language}
				languages={self.props.languages}
				name={alias.name}
				onChange={self.handleChange.bind(null, index)}
				onRemove={self.handleRemove.bind(null, index)}
				primary={alias.primary}
				ref={index}
				removeHidden={index === self.state.aliases.length - 1}
				sortName={alias.sortName}
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
								<span
									aria-hidden="true"
									className="fa fa-angle-double-right"
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
