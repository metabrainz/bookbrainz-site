/*
 * Copyright (C) 2015  Ben Ockmore
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

const IdentifierRow = React.createClass({
	getValue: function() {
		'use strict';

		return {
			type: parseInt(this.refs.type.getValue()),
			value: this.refs.value.getValue()
		};
	},
	validationState: function() {
		'use strict';

		const self = this;
		if (this.props.type) {
			const type = this.props.types.filter(function(testType) {
				return testType.id === self.props.type;
			})[0];

			const regex = new RegExp(type.validation_regex);

			if (regex.test(this.props.value)) {
				return 'success';
			}
			else {
				return 'error';
			}
		}
		else if (this.props.value) {
			return false;
		}
		else {
			return null;
		}
	},
	getValid: function() {
		'use strict';

		const value = this.refs.value.getValue();
		const typeId = parseInt(this.refs.type.getValue());

		let selectedType = this.props.types.filter(function(type) {
			return type.id === typeId;
		});

		if (selectedType.length) {
			selectedType = selectedType[0];
			const regex = new RegExp(selectedType.validation_regex);
			return regex.test(value);
		}
		else {
			return false;
		}
	},
	render: function() {
		'use strict';

		return (
			<div className='row'>
				<div className='col-md-4'>
					<Select
						labelAttribute='label'
						idAttribute='id'
						ref='type'
						value={this.props.type}
						bsStyle={this.validationState()}
						wrapperClassName='col-md-12'
						placeholder='Select identifier type…'
						noDefault
						options={this.props.types}
						onChange={this.props.onChange}/>
				</div>
				<div className='col-md-4'>
					<Input
						type='text'
						value={this.props.value}
						bsStyle={this.validationState()}
						wrapperClassName='col-md-12'
						ref='value'
						onChange={this.props.onChange}/>
				</div>
				<div className='col-md-2'>
					<Button bsStyle='danger' className={this.props.removeHidden ? 'hidden' : ''} onClick={this.props.onRemove}>
						<span className='fa fa-times' />
					</Button>
				</div>
			</div>
		);
	}
});

const IdentifierList = React.createClass({
	getInitialState: function() {
		'use strict';

		const existing = this.props.identifiers || [];
		existing.push({
			value: '',
			type: null
		});

		existing.forEach(function(identifier, i) {
			identifier.key = i;
			identifier.valid = true;
		});

		return {
			identifiers: existing,
			rowsSpawned: existing.length
		};
	},
	getValue: function() {
		'use strict';

		return this.state.identifiers.slice(0, -1).map(function(identifier) {
			const data = {
				value: identifier.value,
				typeId: identifier.type
			};

			if (identifier.id) {
				data.id = identifier.id;
			}

			return data;
		});
	},
	handleChange: function(index) {
		'use strict';

		const updatedIdentifiers = this.state.identifiers.slice();
		const updatedIdentifier = this.refs[index].getValue();

		// Attempt to guess the type, if the value was previously blank
		if (updatedIdentifiers[index].value === '') {
			let newValue = updatedIdentifier.value;
			this.props.types.forEach(function(type) {
				if (type.detection_regex) {
					const detectionRegex = new RegExp(type.detection_regex);
					const regexResult =
						detectionRegex.exec(updatedIdentifier.value);
					if (regexResult) {
						// Don't assign directly to updatedIdentifier, to avoid
						// multiple transformations.
						newValue = regexResult[1];
						updatedIdentifier.type = type.id;
					}
				}
			});
			updatedIdentifier.value = newValue;
		}

		updatedIdentifiers[index] = {
			value: updatedIdentifier.value,
			type: updatedIdentifier.type,
			key: updatedIdentifiers[index].key,
			valid: this.refs[index].getValid()
		};

		if (this.state.identifiers[index].id) {
			updatedIdentifiers[index].id = this.state.identifiers[index].id;
		}

		let rowsSpawned = this.state.rowsSpawned;
		if (index === this.state.identifiers.length - 1) {
			updatedIdentifiers.push({
				value: '',
				type: null,
				key: rowsSpawned,
				valid: true
			});

			rowsSpawned++;
		}

		this.setState({
			identifiers: updatedIdentifiers,
			rowsSpawned: rowsSpawned
		});
	},
	valid: function() {
		'use strict';

		return this.state.identifiers.every(function(identifier) {
			return identifier.valid;
		});
	},
	handleRemove: function(index) {
		'use strict';

		const updatedIdentifiers = this.state.identifiers.slice();

		if (index !== this.state.identifiers.length - 1) {
			updatedIdentifiers.splice(index, 1);

			this.setState({
				identifiers: updatedIdentifiers
			});
		}
	},
	render: function() {
		'use strict';

		const self = this;

		const rows = this.state.identifiers.map(function(identifier, index) {
			return (
				<IdentifierRow
					key={identifier.key}
					ref={index}
					value={identifier.value}
					type={identifier.type}
					types={self.props.types}
					onChange={self.handleChange.bind(null, index)}
					onRemove={self.handleRemove.bind(null, index)}
					removeHidden={index === self.state.identifiers.length - 1} />
			);
		});

		return (
			<div>
				<div className='row margin-top-1'>
					<label className='col-md-3 text-right'>Identifiers</label>
					<label className='col-md-3 text-center'>Type</label>
					<label className='col-md-3 text-center'>Value</label>
				</div>
				<div className='row'>
					<div className='col-md-9 col-md-offset-3'>
						{rows}
					</div>
				</div>
			</div>
		);
	}
});

module.exports = IdentifierList;
