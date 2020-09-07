/*
 * Copyright (C) 2015  Ohm Patel
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

import * as bootstrap from 'react-bootstrap';

import {differenceBy as _differenceBy, kebabCase as _kebabCase, startCase as _startCase} from 'lodash';

import AddToCollectionModal from './add-to-collection-modal';
import CallToAction from './call-to-action';
import PropTypes from 'prop-types';
import React from 'react';
import {genEntityIconHTMLElement} from '../../../helpers/entity';


const {Alert, Badge, Button, ButtonGroup, Row, Table} = bootstrap;

/**
 * Renders the document and displays the 'SearchResults' page.
 * @returns {ReactElement} a HTML document which displays the SearchResults.
 * @param {object} props - Properties passed to the component.
 */
class SearchResults extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			message: {
				text: null,
				type: null
			},
			selected: [],
			showModal: false
		};

		this.handleAddToCollection = this.handleAddToCollection.bind(this);
		this.toggleRow = this.toggleRow.bind(this);
		this.onCloseModal = this.onCloseModal.bind(this);
		this.handleShowModal = this.handleShowModal.bind(this);
		this.handleAlertDismiss = this.handleAlertDismiss.bind(this);
		this.closeModalAndShowMessage = this.closeModalAndShowMessage.bind(this);
		this.handleClearSelected = this.handleClearSelected.bind(this);
	}

	onCloseModal() {
		this.setState({showModal: false});
	}

	handleShowModal() {
		if (this.props.user) {
			this.setState({showModal: true});
		}
		else {
			this.setState({
				message: {
					text: 'You need to be logged in',
					type: 'danger'
				}
			});
		}
	}

	closeModalAndShowMessage(message) {
		this.setState({
			message,
			showModal: false
		});
	}

	handleAlertDismiss() {
		this.setState({message: {}});
	}

	toggleRow(entity) {
		// eslint-disable-next-line react/no-access-state-in-setstate
		const oldSelected = this.state.selected;
		let newSelected;
		if (oldSelected.find(selected => selected.bbid === entity.bbid)) {
			newSelected = oldSelected.filter(selected => selected.bbid !== entity.bbid);
		}
		else {
			newSelected = [...oldSelected, entity];
		}
		this.setState({
			selected: newSelected
		});
	}

	handleClearSelected() {
		this.setState({selected: []});
	}

	handleAddToCollection() {
		const selectedEntities = this.state.selected;
		if (selectedEntities.length) {
			const areAllEntitiesOfSameType = selectedEntities.every(entity => entity.type === selectedEntities[0].type);
			const entityTypes = ['Author', 'Edition', 'EditionGroup', 'Publisher', 'Work'];
			if (areAllEntitiesOfSameType) {
				if (entityTypes.includes(selectedEntities[0].type)) {
					this.setState({message: {}, showModal: true});
				}
				else {
					this.setState({
						message: {
							text: `${selectedEntities[0].type} cannot be added to a collection`,
							type: 'danger'
						}
					});
				}
			}
			else {
				this.setState({
					message: {
						text: 'Selected entities should be of same type',
						type: 'danger'
					}
				});
			}
		}
		else {
			this.setState({
				message: {
					text: 'Nothing Selected',
					type: 'danger'
				}
			});
		}
	}

	render() {
		const noResults = !this.props.results || this.props.results.length === 0;
		if (noResults) {
			return (
				<div className="text-center">
					<hr className="thin"/>
					<h2 style={{color: '#754e37'}}>
						No results found
					</h2>
					{
						!this.props.condensed &&
						<Row>
							<small>Make sure the spelling is correct, and that you have selected the correct type in the search bar.</small>
							<hr className="wide"/>
							<h3>Are we missing an entry?</h3>
							<CallToAction/>
						</Row>
					}
				</div>
			);
		}

		const results = this.props.results.map((result) => {
			if (!result) {
				return null;
			}
			const name = result.defaultAlias ? result.defaultAlias.name :
				'(unnamed)';

			const aliases = !this.props.condensed && result.aliasSet &&
				Array.isArray(result.aliasSet.aliases) && result.aliasSet.aliases;

			const secondaryAliases = !this.props.condensed && aliases &&
				_differenceBy(aliases, [result.defaultAlias], 'id').map(alias => alias.name).join(', ');

			const disambiguation = result.disambiguation ? <small>({result.disambiguation.comment})</small> : '';
			// No redirect link for Area entity results
			const link = result.type === 'Area' ?
				`//musicbrainz.org/area/${result.bbid}` :
				`/${_kebabCase(result.type)}/${result.bbid}`;

			/* eslint-disable react/jsx-no-bind */
			return (
				<tr key={result.bbid}>
					{
						!this.props.condensed &&
						<td>
							{
								this.props.user ?
									<input
										checked={this.state.selected.find(selected => selected.bbid === result.bbid)}
										className="checkboxes"
										type="checkbox"
										onChange={() => this.toggleRow(result)}
									/> : null
							}
							{genEntityIconHTMLElement(result.type)}{_startCase(result.type)}
						</td>
					}
					<td>
						<a href={link}>
							{name} {disambiguation}
						</a>
					</td>
					{
						!this.props.condensed &&
						<td>
							{secondaryAliases}
						</td>
					}
				</tr>
			);
		});
		let tableCssClasses = 'table table-striped';
		if (this.props.condensed) {
			tableCssClasses += ' table-condensed';
		}

		return (
			<div>
				{
					this.props.user ?
						<div>
							<AddToCollectionModal
								bbids={this.state.selected.map(selected => selected.bbid)}
								closeModalAndShowMessage={this.closeModalAndShowMessage}
								entityType={this.state.selected[0]?.type}
								handleCloseModal={this.onCloseModal}
								show={this.state.showModal}
								userId={this.props.user.id}
							/>
						</div> : null
				}
				{
					!this.props.condensed &&
					<h3 style={{color: '#754e37'}}>
						Search Results
					</h3>
				}
				<hr className="thin"/>
				<Table
					responsive
					className={tableCssClasses}
				>
					{
						!this.props.condensed &&
						<thead>
							<tr>
								<th className="col-sm-3">Type</th>
								<th className="col-sm-5">Name</th>
								<th className="col-sm-4">Aliases</th>
							</tr>
						</thead>
					}
					<tbody>
						{results}
					</tbody>
				</Table>
				{
					this.state.message.text ?
						<Alert
							bsStyle={this.state.message.type}
							className="margin-top-1"
							onDismiss={this.handleAlertDismiss}
						>
							{this.state.message.text}
						</Alert> : null

				}
				{
					this.props.user ?
						<ButtonGroup>
							<Button
								bsStyle="primary"
								disabled={!this.state.selected.length}
								type="button"
								onClick={this.handleAddToCollection}
							>
								{genEntityIconHTMLElement('Collection')}
									Add to Collection
							</Button>
							<Button
								bsStyle="warning"
								disabled={!this.state.selected.length}
								type="button"
								onClick={this.handleClearSelected}
							>
								Clear <Badge>{this.state.selected.length}</Badge> selected
							</Button>
						</ButtonGroup> : null
				}
			</div>
		);
	}
}

SearchResults.displayName = 'SearchResults';
SearchResults.propTypes = {
	condensed: PropTypes.bool,
	results: PropTypes.array,
	user: PropTypes.object.isRequired
};
SearchResults.defaultProps = {
	condensed: false,
	results: null
};

export default SearchResults;
