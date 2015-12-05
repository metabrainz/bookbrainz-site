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
const Alert = require('react-bootstrap').Alert;
const PageHeader = require('react-bootstrap').PageHeader;
const Select = require('../input/select2.jsx');
const SearchSelect = require('../input/entity-search.jsx');
const _ = require('underscore');
const request = require('superagent');
require('superagent-bluebird-promise');
const utils = require('../../../server/helpers/utils.js');

const renderRelationship = require('../../../server/helpers/render.js');

const validators = require('../validators');

function getRelationshipTypeById(relationships, id) {
	'use strict';

	return _.find(
		relationships, (relationship) => relationship.id === id
	);
}

const RelationshipRow = React.createClass({
	displayName: 'RelationshipRow',
	propTypes: {
		entity: React.PropTypes.shape({
			bbid: React.PropTypes.string
		}),
		onChange: React.PropTypes.func,
		onDelete: React.PropTypes.func,
		onSelect: React.PropTypes.func,
		onSwap: React.PropTypes.func,
		relationship: React.PropTypes.shape({
			source: React.PropTypes.object,
			target: React.PropTypes.object,
			type: React.PropTypes.number,
			initialSource: React.PropTypes.object,
			initialTarget: React.PropTypes.object,
			initialType: React.PropTypes.number
		}),
		relationshipTypes:
			React.PropTypes.arrayOf(validators.relationshipType)
	},
	getInitialState() {
		'use strict';

		return {
			deleted: false,
			entitiesSwapped: false,
			swapped: false
		};
	},
	getValue() {
		'use strict';

		return {
			source: this.refs.source.getValue(),
			target: this.refs.target.getValue(),
			type: this.refs.type.getValue() ?
				parseInt(this.refs.type.getValue(), 10) : null
		};
	},
	swap() {
		'use strict';

		this.setState({a: this.state.b, b: this.state.a});
	},
	destroy() {
		'use strict';

		this.setState({deleted: true});
		this.props.onDelete();
	},
	reset() {
		'use strict';

		this.setState({deleted: false});
	},
	selected() {
		'use strict';

		return this.refs.sel.getChecked();
	},
	added() {
		'use strict';

		const initiallyEmpty = !this.props.relationship.initialTarget &&
			!this.props.relationship.initialType;
		const nowSet = this.props.relationship.target ||
			this.props.relationship.type;
		return Boolean(initiallyEmpty && nowSet);
	},
	edited() {
		'use strict';

		const rel = this.props.relationship;
		const aChanged = (rel.source && rel.source.bbid) !==
			(rel.initialSource && rel.initialSource.bbid);
		const bChanged = (rel.target && rel.target.bbid) !==
			(rel.initialTarget && rel.initialTarget.bbid);
		const typeChanged = rel.type !== rel.initialType;
		return Boolean(aChanged || bChanged || typeChanged);
	},
	renderedRelationship() {
		'use strict';

		const rel = this.props.relationship;

		const relationshipType =
			getRelationshipTypeById(this.props.relationshipTypes, rel.type);

		if (!this.valid()) {
			return null;
		}

		return {
			__html: renderRelationship(
				[rel.source, rel.target], relationshipType, null
			)
		};
	},
	rowClass() {
		'use strict';

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
	},
	valid() {
		'use strict';

		const rel = this.props.relationship;
		if (rel.source && rel.target && rel.type) {
			return true;
		}

		return false;
	},
	disabled() {
		'use strict';

		// Temporarily disable editing until the webservice/orm supports this
		const rel = this.props.relationship;
		return Boolean(rel.initialSource && rel.initialTarget);
	},
	render() {
		'use strict';

		const deleteButton = this.rowClass() || this.valid() ? (
			<Button
				bsStyle="danger"
				onClick={this.destroy}
			>
				<span className="fa fa-times"/>&nbsp;Delete
				<span className="sr-only"> Relationship</span>
			</Button>
		) : null;

		const resetButton = (
			<Button
				bsStyle="primary"
				onClick={this.reset}
			>
				<span className="fa fa-undo"/>&nbsp;Reset
				<span className="sr-only"> Relationship</span>
			</Button>
		);

		const swapButton = (
			<Button
				bsStyle="primary"
				onClick={this.props.onSwap}
			>
				<span className="fa fa-exchange"/>&nbsp;Swap
				<span className="sr-only"> Entities</span>
			</Button>
		);

		const sourceEntity = this.props.relationship.source;
		if (sourceEntity) {
			sourceEntity.text = sourceEntity.default_alias ?
				sourceEntity.default_alias.name : '(unnamed)';
			sourceEntity.id = sourceEntity.bbid;
		}

		const targetEntity = this.props.relationship.target;
		if (targetEntity) {
			targetEntity.text = targetEntity.default_alias ?
				targetEntity.default_alias.name : '(unnamed)';
			targetEntity.id = targetEntity.bbid;
		}

		let validationState = null;
		if (this.rowClass()) {
			validationState = this.valid() ? 'success' : 'error';
		}

		const targetInput = (
			<SearchSelect
				bsStyle={validationState}
				collection="entity"
				disabled={
					this.disabled() || this.state.deleted ||
					(targetEntity && targetEntity.bbid) ===
						this.props.entity.bbid
				}
				labelClassName="col-md-4"
				onChange={this.props.onChange}
				placeholder="Select entity…"
				ref="target"
				select2Options={{width: '100%'}}
				standalone
				value={targetEntity}
				wrapperClassName="col-md-4"
			/>
		);

		const deleteOrResetButton =
			this.state.deleted ? resetButton : deleteButton;

		return (
			<div
				className={`list-group-item margin-top-1 + ${this.rowClass()}`}
			>
				<div className="row">
					<div className="col-md-1 text-center margin-top-1">
						<Input
							className="margin-left-0"
							disabled={this.disabled() || this.state.deleted}
							label=" "
							onClick={this.props.onSelect}
							ref="sel"
							type="checkbox"
						/>
					</div>
					<div className="col-md-11">
						<div className="row">
							<SearchSelect
								bsStyle={validationState}
								collection="entity"
								disabled={
									this.disabled() || this.state.deleted ||
									(sourceEntity && sourceEntity.bbid) ===
										this.props.entity.bbid
								}
								labelClassName="col-md-4"
								onChange={this.props.onChange}
								placeholder="Select entity…"
								ref="source"
								select2Options={{width: '100%'}}
								standalone
								value={sourceEntity}
								wrapperClassName="col-md-4"
							/>
							<div className="col-md-4">
								<Select
									bsStyle={validationState}
									defaultValue={this.props.relationship.type}
									disabled={
										this.disabled() || this.state.deleted
									}
									idAttribute="id"
									labelAttribute="label"
									noDefault
									onChange={this.props.onChange}
									options={this.props.relationshipTypes}
									placeholder="Select relationship type…"
									ref="type"
									select2Options={{width: '100%'}}
								/>
							</div>
							{targetInput}
						</div>
						<div className="row">
							<div className="col-md-9">
								<p dangerouslySetInnerHTML=
									{this.renderedRelationship()}
								/>
							</div>
							<div className="col-md-3 text-right">
								{
									this.state.deleted || this.disabled() ?
										null : swapButton
								}
								{this.disabled() ? null : deleteOrResetButton}
							</div>

						</div>
					</div>
				</div>

			</div>
		);
	}
});

const RelationshipEditor = React.createClass({
	displayName: 'RelationshipEditor',
	propTypes: {
		entity: React.PropTypes.shape({
			bbid: React.PropTypes.string
		}),
		loadedEntities: React.PropTypes.arrayOf(React.PropTypes.shape({
			bbid: React.PropTypes.string
		})),
		relationships: React.PropTypes.arrayOf(React.PropTypes.shape({
			source: React.PropTypes.object,
			target: React.PropTypes.object,
			type: React.PropTypes.number
		}))
	},
	getInitialState() {
		'use strict';

		const existing = this.props.relationships || [];
		existing.push({
			source: this.props.entity,
			target: null,
			type: null
		});

		existing.forEach((rel, i) => {
			rel.key = i;
			rel.initialSource = rel.source;
			rel.initialTarget = rel.target;
			rel.initialType = rel.type;
			rel.valid = rel.changed = false;
		});

		return {
			loadedEntities: this.props.loadedEntities,
			relationships: existing,
			rowsSpawned: existing.length,
			numSelected: 0
		};
	},
	getValue() {
		'use strict';

		const relationships = [];

		for (let i = 0; i < this.state.relationships.length; i++) {
			relationships.push(this.refs[i].getValue());
		}

		return relationships;
	},
	handleSubmit() {
		'use strict';

		const changedRelationships = _.filter(
			this.state.relationships, (rel) => rel.changed && rel.valid
		);

		request.post('./relationships/handler')
		.send(changedRelationships.map((rel) => ({
			id: [],
			relationship_type: {
				relationship_type_id: rel.type
			},
			entities: [
				{
					entity_gid: rel.source.bbid,
					position: 0
				},
				{
					entity_gid: rel.target.bbid,
					position: 1
				}
			]
		})))
		.promise()
		.then(() => {
			window.location.href = utils.getEntityLink(this.props.entity);
		});
	},
	getInternalValue() {
		'use strict';

		const updatedRelationships = this.getValue();

		updatedRelationships.forEach((rel, idx) => {
			rel.key = this.state.relationships[idx].key;
			rel.initialSource = this.state.relationships[idx].initialSource;
			rel.initialTarget = this.state.relationships[idx].initialTarget;
			rel.initialType = this.state.relationships[idx].initialType;

			const sourceChanged = (rel.source && rel.source.bbid) !==
				(rel.initialSource && rel.initialSource.bbid);
			const targetChanged = (rel.target && rel.target.bbid) !==
				(rel.initialTarget && rel.initialTarget.bbid);
			const typeChanged = (rel.type !== rel.initialType);
			rel.changed = sourceChanged || targetChanged || typeChanged;
			rel.valid = Boolean(rel.source && rel.target && rel.type);
		});

		return updatedRelationships;
	},
	swap(changedRowIndex) {
		'use strict';

		const updatedRelationships = this.getInternalValue();

		updatedRelationships[changedRowIndex].source =
			this.state.relationships[changedRowIndex].target;
		updatedRelationships[changedRowIndex].target =
			this.state.relationships[changedRowIndex].source;

		const rowsSpawned =
			this.addRowIfNeeded(updatedRelationships, changedRowIndex);

		this.setState({
			relationships: updatedRelationships,
			rowsSpawned
		});
	},
	bulkDelete() {
		'use strict';

		const relationshipsToDelete = _.reject(
			this.state.relationships.map((rel, idx) =>
				this.refs[idx].selected() ? idx : null
			), (idx) => idx === null
		);

		relationshipsToDelete.sort((a, b) => b - a).forEach((idx) => {
			this.refs[idx].destroy();
		});
	},
	stateUpdateNeeded(changedRowIndex) {
		'use strict';

		const updatedRelationship = this.refs[changedRowIndex].getValue();
		const existingRelationship = this.state.relationships[changedRowIndex];

		const sourceJustSetOrUnset = (
			!existingRelationship.source && updatedRelationship.source ||
			existingRelationship.source && !updatedRelationship.source
		);

		const targetJustSetOrUnset = (
			!existingRelationship.target && existingRelationship.target ||
			existingRelationship.target && !existingRelationship.target
		);

		const typeJustSetOrUnset = (
			!existingRelationship.type && updatedRelationship.type ||
			existingRelationship.type && !updatedRelationship.type
		);

		return Boolean(
			sourceJustSetOrUnset || targetJustSetOrUnset || typeJustSetOrUnset
		);
	},
	addRowIfNeeded(updatedRelationships, changedRowIndex) {
		'use strict';
		let rowsSpawned = this.state.rowsSpawned;
		if (changedRowIndex === this.state.relationships.length - 1) {
			updatedRelationships.push({
				initialSource: this.props.entity,
				initialTarget: null,
				initialType: null,
				source: this.props.entity,
				target: null,
				type: null,
				key: rowsSpawned++
			});
		}

		return rowsSpawned;
	},
	deleteRowIfNew(rowToDelete) {
		'use strict';

		if (this.refs[rowToDelete].added()) {
			const updatedRelationships = this.getInternalValue();

			updatedRelationships.splice(rowToDelete, 1);

			let newNumSelected = this.state.numSelected;
			if (this.refs[rowToDelete].selected()) {
				newNumSelected--;
			}

			this.setState({
				relationships: updatedRelationships,
				numSelected: newNumSelected
			});
		}
	},
	handleChange(changedRowIndex) {
		'use strict';

		const updatedRelationships = this.getInternalValue();

		const rowsSpawned =
			this.addRowIfNeeded(updatedRelationships, changedRowIndex);

		this.setState({
			relationships: updatedRelationships,
			rowsSpawned
		});
	},
	handleSelect(selectedRowIndex) {
		'use strict';

		let newNumSelected = this.state.numSelected;
		if (this.refs[selectedRowIndex].selected()) {
			newNumSelected++;
		}
		else {
			newNumSelected--;
		}

		this.setState({
			numSelected: newNumSelected
		});
	},
	hasDataToSubmit() {
		'use strict';

		const changedRelationships = _.filter(
			this.state.relationships, (rel) =>
				rel.changed && rel.valid
		);
		return changedRelationships.length > 0;
	},
	render() {
		'use strict';

		const rows = this.state.relationships.map((rel, index) => (
			<RelationshipRow
				key={rel.key}
				onChange={this.handleChange.bind(null, index)}
				onDelete={this.deleteRowIfNew.bind(null, index)}
				onSelect={this.handleSelect.bind(null, index)}
				onSwap={this.swap.bind(null, index)}
				ref={index}
				relationship={rel}
				{...this.props}
			/>
		));

		const numSelectedString =
			this.state.numSelected ? `(${this.state.numSelected})` : '';

		return (
			<div>
				<PageHeader>
					<span className="pull-right">
						<Button
							bsStyle="danger"
							disabled={this.state.numSelected === 0}
							onClick={this.bulkDelete}
						>
							{`Delete Selected ${numSelectedString}`}
						</Button>
					</span>
					Relationship Editor
				</PageHeader>
				<Alert
					bsStyle="info"
					className="text-center"
				>
					<b>Please note!</b><br/>
					The new relationship editor doesn&rsquo;t yet support
					editing or deleting of existing relationships. This is
					coming soon, but for now, existing relationships show up as
					un-editable.
				</Alert>
				<div className="list-group">
					{rows}
				</div>

				<div className="pull-right">
					<Button
						bsStyle="success"
						disabled={!this.hasDataToSubmit()}
						onClick={this.handleSubmit}
					>
						Submit
					</Button>
				</div>
			</div>
		);
	}
});

module.exports = RelationshipEditor;
