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

const AliasRow = require('./alias-row');

class AliasList extends React.Component {
	constructor(props) {
		super(props);

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

		this.state = {
			aliases: existing,
			rowsSpawned: existing.length
		};

		// React does not autobind non-React class methods
		this.handleChange = this.handleChange.bind(this);
		this.handleRemove = this.handleRemove.bind(this);
	}

	getValue() {
		const aliases = [];

		for (let i = 0; i < this.state.aliases.length; i++) {
			aliases.push(this.refs[i].getValue());
		}

		return aliases;
	}

	stateUpdateNeeded(changedRowIndex) {
		const updatedAlias = this.refs[changedRowIndex].getValue();
		const existingAlias = this.state.aliases[changedRowIndex];

		const aliasSortNameJustSetOrUnset = (
			(!existingAlias.sortName && updatedAlias.sortName) ||
			(existingAlias.sortName && !updatedAlias.sortName)
		);

		const aliasNameJustSetOrUnset = (
			(!existingAlias.name && updatedAlias.name) ||
			(existingAlias.name && !updatedAlias.name)
		);

		const aliasLanguageJustSetOrUnset = (
			(!existingAlias.languageId && updatedAlias.languageId) ||
			(existingAlias.languageId && !updatedAlias.languageId)
		);

		const lastAliasModified =
			changedRowIndex === this.state.aliases.length - 1;

		const defaultJustCheckedOrUnchecked = (
			(!existingAlias.default && updatedAlias.default) ||
			(updatedAlias.default && !existingAlias.default)
		);

		const primaryJustCheckedOrUnchecked = (
			(!existingAlias.primary && updatedAlias.primary) ||
			(updatedAlias.primary && !existingAlias.primary)
		);

		return Boolean(
			aliasSortNameJustSetOrUnset || aliasNameJustSetOrUnset ||
			aliasLanguageJustSetOrUnset || (
				lastAliasModified &&
				(
					defaultJustCheckedOrUnchecked ||
					primaryJustCheckedOrUnchecked
				)
			)
		);
	}

	handleChange(changedRowIndex) {
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
	}

	valid() {
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

		return defaultSet;
	}

	handleRemove(index) {
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
	}

	render() {
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

		const aliasListVisibleClass = this.props.visible ?
			'' :
			'hidden';
		return (
			<div className={aliasListVisibleClass}>
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
								onClick={this.props.onNextClick}
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
}

AliasList.displayName = 'AliasList';
AliasList.propTypes = {
	aliases: React.PropTypes.array,
	visible: React.PropTypes.bool,
	onNextClick: React.PropTypes.func
};

module.exports = AliasList;
