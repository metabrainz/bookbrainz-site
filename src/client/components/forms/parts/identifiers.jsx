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
const Icon = require('react-fontawesome');

const validators = require('../../validators');

const IdentifierRow = React.createClass({
	displayName: 'identifierRowComponent',
	propTypes: {
		removeHidden: React.PropTypes.bool,
		typeId: React.PropTypes.number,
		types: React.PropTypes.arrayOf(validators.identifierType),
		value: React.PropTypes.string,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func
	},
	getValue() {
		'use strict';

		return {
			typeId: parseInt(this.typeId.getValue(), 10),
			value: this.value.getValue()
		};
	},
	validationState() {
		'use strict';

		if (this.props.typeId) {
			const type = this.props.types.filter(
				(testType) => testType.id === this.props.typeId
			)[0];

			if (new RegExp(type.validationRegex).test(this.props.value)) {
				return 'success';
			}
			return 'error';
		}

		if (this.props.value) {
			return false;
		}

		return null;
	},
	getValid() {
		'use strict';

		const value = this.value.getValue();
		const typeId = parseInt(this.typeId.getValue(), 10);

		let selectedType = this.props.types.filter(
			(type) => type.id === typeId
		);

		if (selectedType.length) {
			selectedType = selectedType[0];
			return new RegExp(selectedType.validationRegex).test(value);
		}

		return false;
	},
	render() {
		'use strict';

		return (
			<div className="row">
				<div className="col-md-4">
					<Select
						noDefault
						bsStyle={this.validationState()}
						idAttribute="id"
						labelAttribute="label"
						options={this.props.types}
						placeholder="Select identifier type…"
						ref={(ref) => this.typeId = ref}
						value={this.props.typeId}
						wrapperClassName="col-md-12"
						onChange={this.props.onChange}
					/>
				</div>
				<div className="col-md-4">
					<Input
						bsStyle={this.validationState()}
						ref={(ref) => this.value = ref}
						type="text"
						value={this.props.value}
						wrapperClassName="col-md-12"
						onChange={this.props.onChange}
					/>
				</div>
				<div className="col-md-2">
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

const IdentifierList = React.createClass({
	displayName: 'identifierListComponent',
	propTypes: {
		identifiers: React.PropTypes.arrayOf(React.PropTypes.shape({
			value: React.PropTypes.string,
			typeId: React.PropTypes.number
		})),
		types: React.PropTypes.arrayOf(validators.identifierType)
	},
	getInitialState() {
		'use strict';

		const existing = this.props.identifiers || [];
		existing.push({
			value: '',
			typeId: null
		});

		existing.forEach((identifier, i) => {
			identifier.key = i;
			identifier.valid = true;
		});

		return {
			identifiers: existing,
			rowsSpawned: existing.length
		};
	},
	getValue() {
		'use strict';

		const LAST_IDENTIFIER = -1;
		return this.state.identifiers.slice(0, LAST_IDENTIFIER)
			.map((identifier) => {
				const data = {
					value: identifier.value,
					typeId: identifier.typeId
				};

				if (identifier.id) {
					data.id = identifier.id;
				}

				return data;
			}
		);
	},
	handleChange(index) {
		'use strict';

		const updatedIdentifiers = this.state.identifiers.slice();
		const updatedIdentifier = this.refs[index].getValue();

		// Attempt to guess the type, if the value was previously blank
		if (updatedIdentifiers[index].value === '') {
			let newValue = updatedIdentifier.value;
			this.props.types.forEach((type) => {
				if (type.detectionRegex) {
					const detectionRegex = new RegExp(type.detectionRegex);
					const regexResult =
						detectionRegex.exec(updatedIdentifier.value);
					if (regexResult) {
						// Don't assign directly to updatedIdentifier, to avoid
						// multiple transformations.
						newValue = regexResult[1];
						updatedIdentifier.typeId = type.id;
					}
				}
			});
			updatedIdentifier.value = newValue;
		}

		updatedIdentifiers[index] = {
			value: updatedIdentifier.value,
			typeId: updatedIdentifier.typeId,
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
				typeId: null,
				key: rowsSpawned,
				valid: true
			});

			rowsSpawned++;
		}

		this.setState({
			identifiers: updatedIdentifiers,
			rowsSpawned
		});
	},
	valid() {
		'use strict';

		return this.state.identifiers.every((identifier) => identifier.valid);
	},
	handleRemove(index) {
		'use strict';

		const updatedIdentifiers = this.state.identifiers.slice();

		if (index !== this.state.identifiers.length - 1) {
			updatedIdentifiers.splice(index, 1);

			this.setState({
				identifiers: updatedIdentifiers
			});
		}
	},
	render() {
		'use strict';

		const self = this;

		const rows = this.state.identifiers.map((identifier, index) =>
			<IdentifierRow
				key={identifier.key}
				ref={index}
				removeHidden={index === self.state.identifiers.length - 1}
				typeId={identifier.typeId}
				types={self.props.types}
				value={identifier.value}
				onChange={self.handleChange.bind(null, index)}
				onRemove={self.handleRemove.bind(null, index)}
			/>
		);

		return (
			<div>
				<div className="row margin-top-1">
					<label className="col-md-3 text-right">Identifiers</label>
					<label className="col-md-3 text-center">Type</label>
					<label className="col-md-3 text-center">Value</label>
				</div>
				<div className="row">
					<div className="col-md-9 col-md-offset-3">
						{rows}
					</div>
				</div>
			</div>
		);
	}
});

module.exports = IdentifierList;
