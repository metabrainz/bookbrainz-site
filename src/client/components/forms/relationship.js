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

const React = require('react');
const request = require('superagent-bluebird-promise');
const _filter = require('lodash.filter');

// XXX: Replace with lodash.reject when breakage is fixed
const _ = require('lodash');

const Alert = require('react-bootstrap').Alert;
const Button = require('react-bootstrap').Button;
const PageHeader = require('react-bootstrap').PageHeader;

const dataHelper = require('../../helpers/data');
const validators = require('../../helpers/react-validators');

const RelationshipRow = require('./parts/relationship-row');

function isRelationshipNew(initialType, initialTarget) {
	'use strict';

	return !(initialType || initialTarget);
}

(() => {
	'use strict';

	class RelationshipEditor extends React.Component {
		constructor(props) {
			super(props);

			const existing = (this.props.relationships || []).map((rel) => ({
				source: rel.source,
				target: rel.target,
				typeId: rel.typeId
			}));

			existing.push({
				source: this.props.entity,
				target: null,
				typeId: null
			});

			existing.forEach((rel, i) => {
				rel.key = i;
				rel.initialSource = rel.source;
				rel.initialTarget = rel.target;
				rel.initialTypeId = rel.typeId;
				rel.valid = rel.changed = false;
			});

			this.state = {
				loadedEntities: this.props.loadedEntities,
				relationships: existing,
				rowsSpawned: existing.length,
				numSelected: 0
			};

			// React does not autobind non-React class methods
			this.handleSubmit = this.handleSubmit.bind(this);
			this.swap = this.swap.bind(this);
			this.handleBulkDelete = this.handleBulkDelete.bind(this);
			this.deleteRowIfNew = this.deleteRowIfNew.bind(this);
			this.handleChange = this.handleChange.bind(this);
			this.handleSelect = this.handleSelect.bind(this);
		}

		getValue() {
			const relationships = [];

			for (let i = 0; i < this.state.relationships.length; i++) {
				relationships.push(this.refs[i].getValue());
			}

			return relationships;
		}

		handleSubmit() {
			const changedRelationships = _filter(
				this.state.relationships, (rel) => rel.changed && rel.valid
			);

			request.post('./relationships/handler')
				.send(changedRelationships)
				.promise()
				.then(() => {
					window.location.href =
						dataHelper.getEntityLink(this.props.entity);
				});
		}

		getInternalValue() {
			const updatedRelationships = this.getValue();

			updatedRelationships.forEach((rel, idx) => {
				rel.key = this.state.relationships[idx].key;
				rel.initialSource = this.state.relationships[idx].initialSource;
				rel.initialTarget = this.state.relationships[idx].initialTarget;
				rel.initialTypeId = this.state.relationships[idx].initialTypeId;

				const sourceChanged =
					dataHelper.entityHasChanged(rel.initialSource, rel.source);
				const targetChanged =
					dataHelper.entityHasChanged(rel.initialTarget, rel.target);
				const typeChanged = (rel.typeId !== rel.initialTypeId);

				rel.changed = sourceChanged || targetChanged || typeChanged;
				rel.valid = Boolean(rel.source && rel.target && rel.typeId);
			});

			return updatedRelationships;
		}

		swap(changedRowIndex) {
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
		}

		handleBulkDelete() {
			const relationshipsToDelete = _.reject(
				this.state.relationships.map((rel, idx) => (
					this.refs[idx].selected() ?
						idx :
						null
				)), (idx) => idx === null
			);

			relationshipsToDelete.sort((a, b) => b - a).forEach((idx) => {
				this.refs[idx].handleDeleteClick();
			});
		}

		addRowIfNeeded(updatedRelationships, changedRowIndex) {
			let rowsSpawned = this.state.rowsSpawned;
			if (changedRowIndex === this.state.relationships.length - 1) {
				updatedRelationships.push({
					initialSource: this.props.entity,
					initialTarget: null,
					initialTypeId: null,
					source: this.props.entity,
					target: null,
					typeId: null,
					key: rowsSpawned++
				});
			}

			return rowsSpawned;
		}

		deleteRowIfNew(rowToDelete) {
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
		}

		handleChange(changedRowIndex) {
			const updatedRelationships = this.getInternalValue();

			const rowsSpawned =
				this.addRowIfNeeded(updatedRelationships, changedRowIndex);

			this.setState({
				relationships: updatedRelationships,
				rowsSpawned
			});
		}

		handleSelect(selectedRowIndex) {
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
		}

		hasDataToSubmit() {
			const changedRelationships = _filter(
				this.state.relationships, (rel) =>
				rel.changed && rel.valid
			);

			return changedRelationships.length > 0;
		}

		render() {
			const typesWithoutDeprecated = _filter(
				this.props.relationshipTypes, (type) => !type.deprecated
			);

			const rows = this.state.relationships.map((rel, index) => (
				<RelationshipRow
					{...this.props}
					key={rel.key}
					ref={index}
					relationship={rel}
					relationshipTypes={
						isRelationshipNew(
							rel.initialTypeId, rel.initialTarget
						) ?
							typesWithoutDeprecated :
							this.props.relationshipTypes
					}
					onChange={this.handleChange.bind(null, index)}
					onDelete={this.deleteRowIfNew.bind(null, index)}
					onSelect={this.handleSelect.bind(null, index)}
					onSwap={this.swap.bind(null, index)}
				/>
			));

			const numSelectedString = this.state.numSelected ?
				`(${this.state.numSelected})` :
				'';

			return (
				<div>
					<PageHeader>
						<span className="pull-right">
							<Button
								bsStyle="danger"
								disabled={this.state.numSelected === 0}
								onClick={this.handleBulkDelete}
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
						coming soon, but for now, existing relationships show up
						as un-editable.
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
	}

	RelationshipEditor.displayName = 'RelationshipEditor';
	RelationshipEditor.propTypes = {
		entity: React.PropTypes.shape({
			bbid: React.PropTypes.string
		}),
		loadedEntities: React.PropTypes.object,
		relationshipTypes: React.PropTypes.arrayOf(validators.labeledProperty),
		relationships: React.PropTypes.arrayOf(React.PropTypes.shape({
			source: React.PropTypes.object,
			target: React.PropTypes.object,
			typeId: React.PropTypes.number
		}))
	};

	module.exports = RelationshipEditor;
})();
