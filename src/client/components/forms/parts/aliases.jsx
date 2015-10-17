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
	getValue: function() {
		'use strict';

		return {
			id: parseInt(this.refs.id.getValue()),
			name: this.refs.name.getValue(),
			sortName: this.refs.sortName.getValue(),
			language: parseInt(this.refs.language.getValue()) || null,
			primary: this.refs.primary.getChecked(),
			default: this.refs.default.getChecked()
		};
	},
	validationState: function() {
		'use strict';

		if (this.props.name || this.props.sortName) {
			if (this.props.name && this.props.sortName) {
				return 'success';
			}
			else {
				return 'error';
			}
		}

		return null;
	},
	getValid: function() {
		'use strict';

		return Boolean(this.refs.name.getValue() && this.refs.sortName.getValue());
	},
	render: function() {
		'use strict';

		return (
			<div className='row' onChange={this.props.onChange}>
				<Input
					type='hidden'
					defaultValue={this.props.aliasId}
					ref='id' />
				<div className='col-md-3'>
					<Input
						type='text'
						defaultValue={this.props.name}
						bsStyle={this.validationState()}
						wrapperClassName='col-md-11'
						ref='name' /> &nbsp;
				</div>
				<div className='col-md-3'>
					<Input
						type='text'
						defaultValue={this.props.sortName}
						bsStyle={this.validationState()}
						wrapperClassName='col-md-11'
						ref='sortName' /> &nbsp;
				</div>
				<div className='col-md-3'>
					<Select
						labelAttribute='name'
						idAttribute='id'
						ref='language'
						defaultValue={this.props.language}
						bsStyle={this.validationState()}
						onChange={this.props.onChange}
						wrapperClassName='col-md-11'
						placeholder='Select alias language…'
						noDefault
						options={this.props.languages} />
				</div>
				<div className='col-md-1'>
					<Input type='checkbox' ref='primary' defaultChecked={this.props.primary} wrapperClassName='col-md-11' label=' '/>
				</div>
				<div className='col-md-1'>
					<Input type='radio' ref='default' defaultChecked={this.props.default} wrapperClassName='col-md-11' label=' ' name='default' />
				</div>
				<div className='col-md-1 text-right'>
					<Button bsStyle='danger' className={this.props.removeHidden ? 'hidden' : ''} onClick={this.props.onRemove}>
						<span className='fa fa-times' />
					</Button>
				</div>
			</div>
		);
	}
});

const AliasList = React.createClass({
	getInitialState: function() {
		'use strict';

		const existing = this.props.aliases || [];
		existing.push({
			name: '',
			sortName: '',
			language: null,
			primary: true,
			default: false
		});

		existing.forEach(function(alias, i) {
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
	getValue: function() {
		'use strict';

		const aliases = [];

		for (let i = 0; i < this.state.aliases.length; i++) {
			aliases.push(this.refs[i].getValue());
		}

		return aliases;
	},
	handleChange: function(index) {
		'use strict';

		const self = this;
		const updatedAlias = this.refs[index].getValue();
		const targetAlias = this.state.aliases[index];

		if ((!targetAlias.sortName && updatedAlias.sortName) ||
				(targetAlias.sortName && !updatedAlias.sortName) ||
				(!targetAlias.name && updatedAlias.name) ||
				(targetAlias.name && !updatedAlias.name) ||
				(updatedAlias.default && index === this.state.aliases.length - 1) ||
				(!targetAlias.language && updatedAlias.language) ||
				(!updatedAlias.primary && index === this.state.aliases.length - 1)) {
			const updatedAliases = this.getValue();

			updatedAliases.forEach(function(alias, idx) {
				alias.key = self.state.aliases[idx].key;
			});

			let rowsSpawned = this.state.rowsSpawned;
			if (index === this.state.aliases.length - 1) {
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
				rowsSpawned: rowsSpawned
			});
		}
	},
	valid: function() {
		'use strict';

		let defaultSet = false;
		const numRows = this.state.aliases.length;

		for (let i = 0; i < numRows; i++) {
			const aliasRow = this.refs[i];
			const alias = aliasRow.getValue();

			if (aliasRow.getValid() === false && numRows > 1 && (alias.name || alias.sortName)) {
				return false;
			}
			else if (!defaultSet) {
				defaultSet = alias.default;
			}
		}

		return defaultSet || numRows === 1;
	},
	handleRemove: function(index) {
		'use strict';

		const self = this;
		const updatedAliases = this.getValue();

		if (index !== this.state.aliases.length - 1) {
			updatedAliases.forEach(function(alias, idx) {
				alias.key = self.state.aliases[idx].key;
			});

			updatedAliases.splice(index, 1);

			this.setState({
				aliases: updatedAliases
			});
		}
	},
	render: function() {
		'use strict';

		const self = this;

		const rows = this.state.aliases.map(function(alias, index) {
			return (
				<AliasRow
					key={alias.key}
					ref={index}
					aliasId={alias.id}
					name={alias.name}
					sortName={alias.sortName}
					language={alias.language}
					primary={alias.primary}
					default={alias.default}
					languages={self.props.languages}
					onChange={self.handleChange.bind(null, index)}
					onRemove={self.handleRemove.bind(null, index)}
					removeHidden={index === self.state.aliases.length - 1} />
			);
		});

		return (
			<div className={(this.props.visible === false) ? 'hidden' : ''}>
				<h2>Add Aliases</h2>
				<p className='lead'>Add some aliases to the entity.</p>
				<div className='form-horizontal'>
					<div className='row margin-top-1'>
						<label className='col-md-3'>Name</label>
						<label className='col-md-3'>Sort Name</label>
						<label className='col-md-3'>Language</label>
						<label className='col-md-1'>Primary</label>
						<label className='col-md-1'>Default</label>
					</div>
					{rows}
				</div>

				<nav className='margin-top-1'>
					<ul className="pager">
						<li className="next">
							<a href='#' onClick={this.props.nextClick}>Next <span aria-hidden="true" className='fa fa-angle-double-right'/>
							</a>
						</li>
					</ul>
				</nav>
			</div>
		);
	}
});

module.exports = AliasList;
