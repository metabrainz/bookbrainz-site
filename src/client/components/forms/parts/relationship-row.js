/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
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

const Handlebars = require('handlebars');
const Icon = require('react-fontawesome');
const React = require('react');
const _find = require('lodash.find');

const Button = require('react-bootstrap').Button;
const Input = require('react-bootstrap').Input;

const Select = require('../../input/select2');
const SearchSelect = require('../../input/entity-search');

const dataHelper = require('../../../helpers/data');
const validators = require('../../../helpers/react-validators');

function renderRelationship(relationship) {
	'use strict';

	const template = Handlebars.compile(
		relationship.type.displayTemplate,
		{noEscape: true}
	);

	const data = {
		entities: [
			relationship.source,
			relationship.target
		].map((entity) => {
			// Linkify source and target based on default alias
			const name =
				entity.defaultAlias ? entity.defaultAlias.name : '(unnamed)';
			return `<a href="${dataHelper.getEntityLink(entity)}">${name}</a>`;
		})
	};

	return template(data);
}

function getRelationshipTypeById(types, id) {
	'use strict';

	return _find(
		types, (type) => type.id === id
	);
}

class RelationshipRow extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			deleted: false,
			entitiesSwapped: false,
			swapped: false
		};

		// React does not autobind non-React class methods
		this.swap = this.swap.bind(this);
		this.handleDeleteClick = this.handleDeleteClick.bind(this);
		this.handleResetClick = this.handleResetClick.bind(this);
	}

	getValue() {
		return {
			source: this.source.getValue(),
			target: this.target.getValue(),
			typeId: this.type.getValue() ?
				parseInt(this.type.getValue(), 10) : null
		};
	}

	swap() {
		this.setState({
			a: this.state.b,
			b: this.state.a
		});
	}

	handleDeleteClick() {
		this.setState({deleted: true});
		this.props.onDelete();
	}

	handleResetClick() {
		this.setState({deleted: false});
	}

	selected() {
		return this.select.getChecked();
	}

	added() {
		const initiallyEmpty = !this.props.relationship.initialTarget &&
			!this.props.relationship.initialTypeId;
		const nowSet = this.props.relationship.target ||
			this.props.relationship.typeId;

		return Boolean(initiallyEmpty && nowSet);
	}

	edited() {
		const rel = this.props.relationship;
		const aChanged =
			dataHelper.entityHasChanged(rel.initialSource, rel.source);
		const bChanged =
			dataHelper.entityHasChanged(rel.initialTarget, rel.target);
		const typeChanged = rel.typeId !== rel.initialTypeId;

		return Boolean(aChanged || bChanged || typeChanged);
	}

	renderedRelationship() {
		const rel = this.props.relationship;

		if (!this.valid()) {
			return null;
		}

		rel.type = this.currentRelationshipType();

		return {__html: renderRelationship(rel)};
	}

	rowClass() {
		if (this.disabled()) {
			return ' disabled';
		}

		if (this.state.deleted) {
			return ' list-group-item-danger';
		}

		if (this.added()) {
			return ' list-group-item-success';
		}

		if (this.edited()) {
			return ' list-group-item-warning';
		}

		return '';
	}

	valid() {
		const rel = this.props.relationship;

		return Boolean(rel.source && rel.target && rel.typeId);
	}

	disabled() {
		// Temporarily disable editing until the webservice/orm supports
		// this
		const rel = this.props.relationship;

		return Boolean(rel.initialSource && rel.initialTarget);
	}

	currentRelationshipType() {
		return getRelationshipTypeById(
			this.props.relationshipTypes, this.props.relationship.typeId
		);
	}

	render() {
		const deleteButton = this.rowClass() || this.valid() ? (
			<Button
				bsStyle="danger"
				onClick={this.handleDeleteClick}
			>
				<Icon name="times"/>&nbsp;Delete
				<span className="sr-only"> Relationship</span>
			</Button>
		) : null;

		const resetButton = (
			<Button
				bsStyle="primary"
				onClick={this.handleResetClick}
			>
				<Icon name="undo"/>&nbsp;Reset
				<span className="sr-only"> Relationship</span>
			</Button>
		);

		const swapButton = (
			<Button
				bsStyle="primary"
				onClick={this.props.onSwap}
			>
				<Icon name="exchange"/>&nbsp;Swap
				<span className="sr-only"> Entities</span>
			</Button>
		);

		function _entityToOption(entity) {
			if (!entity) {
				return null;
			}

			entity.text =
				entity.defaultAlias ? entity.defaultAlias.name : '(unnamed)';
			entity.id = entity.bbid;

			return entity;
		}

		const sourceEntity =
			_entityToOption(this.props.relationship.source);
		const targetEntity =
			_entityToOption(this.props.relationship.target);

		let validationState = null;
		if (this.rowClass()) {
			validationState = this.valid() ? 'success' : 'error';
		}

		const select2Options = {
			allowClear: false,
			width: '100%'
		};

		const targetInput = (
			<SearchSelect
				standalone
				bsStyle={validationState}
				disabled={
				this.disabled() || this.state.deleted ||
				(targetEntity && targetEntity.bbid) ===
					this.props.entity.bbid
			}
				labelClassName="col-md-4"
				placeholder="Select entity…"
				ref={(ref) => this.target = ref}
				select2Options={select2Options}
				value={targetEntity}
				wrapperClassName="col-md-4"
				onChange={this.props.onChange}
			/>
		);

		const deleteOrResetButton =
			this.state.deleted ? resetButton : deleteButton;

		let deprecationWarning = null;
		const currentType = this.currentRelationshipType();
		if (currentType && currentType.deprecated) {
			deprecationWarning = (
				<span className="text-danger">
					<Icon name="warning"/>&nbsp;
					Relationship type deprecated &mdash; please avoid!
				</span>
			);
		}

		return (
			<div
				className={
					`list-group-item margin-top-1 + ${this.rowClass()}`
				}
			>
				<div className="row">
					<div className="col-md-1 text-center margin-top-1">
						<Input
							className="margin-left-0"
							disabled={this.disabled() || this.state.deleted}
							label=" "
							ref={(ref) => this.select = ref}
							type="checkbox"
							onClick={this.props.onSelect}
						/>
					</div>
					<div className="col-md-11">
						<div className="row">
							<SearchSelect
								standalone
								bsStyle={validationState}
								disabled={
								this.disabled() || this.state.deleted ||
								(sourceEntity && sourceEntity.bbid) ===
									this.props.entity.bbid
							}
								labelClassName="col-md-4"
								placeholder="Select entity…"
								ref={(ref) => this.source = ref}
								select2Options={select2Options}
								value={sourceEntity}
								wrapperClassName="col-md-4"
								onChange={this.props.onChange}
							/>
							<div className="col-md-4">
								<Select
									noDefault
									bsStyle={validationState}
									defaultValue={
									this.props.relationship.typeId
								}
									disabled={
									this.disabled() || this.state.deleted
								}
									idAttribute="id"
									labelAttribute="label"
									options={this.props.relationshipTypes}
									placeholder="Select relationship type…"
									ref={(ref) => this.type = ref}
									select2Options={select2Options}
									onChange={this.props.onChange}
								/>
							</div>
							{targetInput}
						</div>
						<div className="row">
							<div className="col-md-4">
								<p
									dangerouslySetInnerHTML={
										this.renderedRelationship()
									}
								/>
							</div>
							<div className="col-md-5">
								{deprecationWarning}
							</div>
							<div className="col-md-3 text-right">
								{
									this.state.deleted || this.disabled() ?
										null : swapButton
								}
								{
									this.disabled() ? null : deleteOrResetButton
								}
							</div>

						</div>
					</div>
				</div>

			</div>
		);
	}
}

RelationshipRow.displayName = 'RelationshipRow';
RelationshipRow.propTypes = {
	entity: React.PropTypes.shape({
		bbid: React.PropTypes.string
	}),
	relationship: React.PropTypes.shape({
		source: React.PropTypes.object,
		target: React.PropTypes.object,
		typeId: React.PropTypes.number,
		initialSource: React.PropTypes.object,
		initialTarget: React.PropTypes.object,
		initialTypeId: React.PropTypes.number
	}),
	relationshipTypes: React.PropTypes.arrayOf(validators.labeledProperty),
	onChange: React.PropTypes.func,
	onDelete: React.PropTypes.func,
	onSelect: React.PropTypes.func,
	onSwap: React.PropTypes.func
};

module.exports = RelationshipRow;
