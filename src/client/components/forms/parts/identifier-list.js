/*
 * Copyright (C) 2015  Ben Ockmore
 *               2016  Sean Burke
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

import * as dataHelper from '../../../helpers/data';
import * as validators from '../../../helpers/react-validators';
import IdentifierRow from './identifier-row';
import React from 'react';

class IdentifierList extends React.Component {
	constructor(props) {
		super(props);

		const existing = this.props.identifiers || [];
		existing.push({
			typeId: null,
			value: ''
		});

		existing.forEach((identifier, i) => {
			identifier.key = i;
			identifier.valid = true;
		});

		this.state = {
			identifiers: existing,
			rowsSpawned: existing.length
		};

		// React does not autobind non-React class methods
		this.getValue = this.getValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.valid = this.valid.bind(this);
		this.handleRemove = this.handleRemove.bind(this);
	}

	getValue() {
		const LAST_IDENTIFIER = -1;
		return this.state.identifiers.slice(0, LAST_IDENTIFIER)
			.map((identifier) => {
				const data = {
					typeId: identifier.typeId,
					value: identifier.value
				};

				if (identifier.id) {
					data.id = identifier.id;
				}

				return data;
			});
	}

	handleChange(index) {
		const updatedIdentifiers = this.state.identifiers.slice();
		const updatedIdentifier = this.refs[index].getValue();

		// Attempt to guess the type, if the value was previously blank
		if (this.state.identifiers[index].value === '') {
			let newValue = updatedIdentifier.value;
			this.props.types.forEach((type) => {
				if (type.detectionRegex) {
					const detectionRegex = new RegExp(type.detectionRegex);
					const regexResult =
						detectionRegex.exec(updatedIdentifier.value);

					if (regexResult) {
						// Don't assign directly to updatedIdentifier, to
						// avoid multiple transformations
						newValue = regexResult[1];
						updatedIdentifier.typeId = type.id;
					}
				}
			});
			updatedIdentifier.value = newValue;
		}

		updatedIdentifiers[index] = {
			key: updatedIdentifiers[index].key,
			typeId: updatedIdentifier.typeId,
			valid:
				dataHelper.identifierIsValid(
					updatedIdentifier.typeId,
					updatedIdentifier.value,
					this.props.types
				),
			value: updatedIdentifier.value
		};

		if (this.state.identifiers[index].id) {
			updatedIdentifiers[index].id = this.state.identifiers[index].id;
		}

		let rowsSpawned = this.state.rowsSpawned;
		if (index === this.state.identifiers.length - 1) {
			updatedIdentifiers.push({
				key: rowsSpawned,
				typeId: null,
				valid: true,
				value: ''
			});

			rowsSpawned++;
		}

		this.setState({
			identifiers: updatedIdentifiers,
			rowsSpawned
		});
	}

	valid() {
		return this.state.identifiers.every(
			(identifier) =>
				identifier.valid
		);
	}

	handleRemove(index) {
		const updatedIdentifiers = this.state.identifiers.slice();

		if (index !== this.state.identifiers.length - 1) {
			updatedIdentifiers.splice(index, 1);

			this.setState({
				identifiers: updatedIdentifiers
			});
		}
	}

	render() {
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
					<label className="col-md-3 text-right">
						Identifiers
					</label>
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
}

IdentifierList.displayName = 'IdentifierList';
IdentifierList.propTypes = {
	identifiers: React.PropTypes.arrayOf(React.PropTypes.shape({
		typeId: React.PropTypes.number,
		value: React.PropTypes.string
	})).isRequired,
	types: React.PropTypes.arrayOf(validators.labeledProperty).isRequired
};

export default IdentifierList;
