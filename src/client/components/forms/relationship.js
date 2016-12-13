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

/**
 * Checks if the relationship is new by checking that
   the fields weren't set when the form was loaded
 * @param {boolean} initialType - Initial type of the relationship.
 * @param {boolean} initialTarget - Initial target of the relationship.
 * @returns {boolean} True if initialType and initialTarget are both false
 */

function isRelationshipNew(initialType, initialTarget) {
	'use strict';

	return !(initialType || initialTarget);
}

/**
 * This class is a subclass of ReactComponent,
 which allows the user to create and edit a relationship.
*/

class RelationshipEditor extends React.Component {
	/**
	 * This is a constructor.
	 * It binds the event handler functions defined
	 in the class to the class instance.
	 * @param {props} props - from React.Component constructor
	 * @constructor
	*/
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
	/**
	 * Creates an array of all of the information
	 for all relationships present on the form.
	 * @returns {integer} relationships - All of the information
	*/
	getValue() {
		const relationships = [];

		for (let i = 0; i < this.state.relationships.length; i++) {
			relationships.push(this.refs[i].getValue());
		}

		return relationships;
	}
	/**
	 * Submits the changed, valid relationships.
	 * It is triggered by the onClick event of the SUBMIT button.
	 * @returns {void}
	*/
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
	/**
   	* Gets a list of relationships on the form from getValue(),
	and adds additional information derived from
	the state that is used internally.
	* @returns {integer} updatedRelationships
	- New list of relationships on the form.	*/
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
	/**
	 * Swaps the source and the target
	 of a specified row of updated relationships.
	 * @param {integer} changedRowIndex - Row index that has been changed.
	 * @returns {void}
	*/
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
	/**
	 * This function deletes all relationships which have been selected.
	 * Triggered by the onClick event of the DELETE SELECTED button.
	 * @returns {void}
	*/
	handleBulkDelete() {
		const relationshipsToDelete = _.reject(
			this.state.relationships.map((rel, idx) => (
				this.refs[idx].selected() ? idx : null
			)), (idx) => idx === null
		);

		relationshipsToDelete.sort((a, b) => b - a).forEach((idx) => {
			this.refs[idx].handleDeleteClick();
		});
	}
	/**
	 * This function takes in a row index, checks if it is the last relationship
	 and if it is, then a new row is added.
	 * @param {integer} updatedRelationships -
	   Relationships with correct changed and valid booleans.
	 * @param {integer} changedRowIndex - Row index which has been changed.
	 * @returns {integer} rowsSpawned -
       Total number of rows since the form was loaded.
	*/
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
	/**
	 * This takes in a row index and checks if the row has been added
       since the form was loaded.
	 * If the row was part of the selection, then the number of
       selected rows is decremented
	 * @param {integer} rowToDelete - Row index which may be deleted if it's new
	 * Updates the new state.
	 * @returns {void}
	*/
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
	/**
	 * Gets the most current information about relationships in the form,
	   and saves it in the form state,
	   to update the state following a change and propagate the change
	   to the displayed UI.
	 * @param {integer} changedRowIndex - Row index which has been changed.
	 * @returns {void}
	*/
	handleChange(changedRowIndex) {
		const updatedRelationships = this.getInternalValue();

		const rowsSpawned =
			this.addRowIfNeeded(updatedRelationships, changedRowIndex);

		this.setState({
			relationships: updatedRelationships,
			rowsSpawned
		});
	}
	/**
	 * Takes in a row index, checks if it is selected,
	 and updates the state with the new number of selected relationships.
	 * @param {integer} selectedRowIndex - Row index which has been selected.
	 * @returns {void}
	*/
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
	/**
	 * Checks if there are relationships which have been changed and are valid.
	 * This affects the SUBMIT button visibility
       (i.e., if there is no data to submit, then it will be disabled).
	 * @returns {boolean} True if there are any changed relationships.
	 */
	hasDataToSubmit() {
		const changedRelationships = _filter(
			this.state.relationships, (rel) =>
			rel.changed && rel.valid
		);

		return changedRelationships.length > 0;
	}
	/**
   	 * Creates a display of all relationships in their current state.
	 * Creates a SUBMIT button to submit new relationships
	 * Creates a DELETE SELECTED button to delete selected relationships.
	 * @returns {HTML} an HTML div which displays a RelationshipEditor.
	*/
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
				) ? typesWithoutDeprecated : this.props.relationshipTypes
			}
				onChange={this.handleChange.bind(null, index)}
				onDelete={this.deleteRowIfNew.bind(null, index)}
				onSelect={this.handleSelect.bind(null, index)}
				onSwap={this.swap.bind(null, index)}
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
	collection: React.PropTypes.string,
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
