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

const Icon = require('react-fontawesome');
const React = require('react');

const Input = require('react-bootstrap').Input;
const Button = require('react-bootstrap').Button;

const Select = require('../../input/select2');

const data = require('../../../helpers/data');
const validators = require('../../../helpers/react-validators');

(() => {
	'use strict';

	class IdentifierRow extends React.Component {
		getValue() {
			return {
				typeId: parseInt(this.typeId.getValue(), 10),
				value: this.value.getValue()
			};
		}

		validationState() {
			if (this.props.typeId) {
				const isValid = data.identifierIsValid(
					this.props.typeId,
					this.props.value,
					this.props.types
				);

				return (
					isValid ?
						'success' :
						'error'
				);
			}

			if (this.props.value) {
				return 'error';
			}

			return null;
		}

		getValid() {
			const value = this.value.getValue();
			const typeId = parseInt(this.typeId.getValue(), 10);

			return data.identifierIsValid(typeId, value, this.props.types);
		}

		render() {
			const select2Options = {
				allowClear: false
			};

			const removeHiddenClass = this.props.removeHidden ?
				'hidden' :
				'';
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
							select2Options={select2Options}
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
							className={removeHiddenClass}
							onClick={this.props.onRemove}
						>
							<Icon name="times"/>
						</Button>
					</div>
				</div>
			);
		}
	}

	IdentifierRow.displayName = 'IdentifierRow';
	IdentifierRow.propTypes = {
		removeHidden: React.PropTypes.bool,
		typeId: React.PropTypes.number,
		types: React.PropTypes.arrayOf(validators.labeledProperty),
		value: React.PropTypes.string,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func
	};

	module.exports = IdentifierRow;
})();
