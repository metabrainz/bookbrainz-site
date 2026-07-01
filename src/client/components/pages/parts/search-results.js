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

import {camelCase as _camelCase, differenceBy as _differenceBy, kebabCase as _kebabCase, startCase as _startCase, toLower} from 'lodash';

import AddToCollectionModal from './add-to-collection-modal';
import PropTypes from 'prop-types';
import React from 'react';
import {genEntityIconHTMLElement} from '../../../helpers/entity';
import {withTranslation} from 'react-i18next';


const {Alert, Badge, Button, ButtonGroup, Table} = bootstrap;

// Main entities have a BBID but some other indexed types
// have an ID field instead (collections, editors, areas)
function getId(entity) {
	return entity.bbid ?? entity.id;
}

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
			// eslint-disable-next-line id-length
			const {t: translate} = this.props;
			this.setState({
				message: {
					text: translate('searchResults.loginRequired'),
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
		if (oldSelected.find(selected => getId(selected) === getId(entity))) {
			newSelected = oldSelected.filter(selected => getId(selected) !== getId(entity));
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
		// eslint-disable-next-line id-length
		const {t: translate} = this.props;
		const selectedEntities = this.state.selected;
		if (selectedEntities.length) {
			const areAllEntitiesOfSameType = selectedEntities.every(entity => entity.type === selectedEntities[0].type);
			const entityTypes = ['Author', 'Edition', 'EditionGroup', 'Publisher', 'Series', 'Work'];
			if (areAllEntitiesOfSameType) {
				if (entityTypes.includes(selectedEntities[0].type)) {
					this.setState({message: {}, showModal: true});
				}
				else {
					this.setState({
						message: {
							text: translate('searchResults.cannotAdd', {type: selectedEntities[0].type}),
							type: 'danger'
						}
					});
				}
			}
			else {
				this.setState({
					message: {
						text: translate('searchResults.sameTypeRequired'),
						type: 'danger'
					}
				});
			}
		}
		else {
			this.setState({
				message: {
					text: translate('searchResults.nothingSelected'),
					type: 'danger'
				}
			});
		}
	}

	render() {
		const noResults = !this.props.results || this.props.results.length === 0;
		// eslint-disable-next-line id-length
		const {t: translate} = this.props;

		const results = this.props.results.map((result) => {
			if (!result) {
				return null;
			}
			const id = getId(result);
			const name = result.defaultAlias ? result.defaultAlias.name :
				translate('common:unnamed');

			const aliases = !this.props.condensed && result.aliasSet &&
				Array.isArray(result.aliasSet.aliases) && result.aliasSet.aliases;

			const secondaryAliases = !this.props.condensed && aliases &&
				_differenceBy(aliases, [result.defaultAlias], 'id').map(alias => alias.name).join(', ');

			const disambiguation = result.disambiguation ? <small>({result.disambiguation.comment})</small> : '';
			// No redirect link for Area entity results
			const link = result.type === 'Area' ?
				`//musicbrainz.org/area/${id}` :
				`/${_kebabCase(result.type)}/${id}`;

			/* eslint-disable react/jsx-no-bind */
			return (
				<tr key={id}>
					{
						!this.props.condensed &&
						<td>
							{
								this.props.user ?
									<input
										checked={this.state.selected.find(selected => getId(selected) === id)}
										className="checkboxes"
										type="checkbox"
										onChange={() => this.toggleRow(result)}
									/> : null
							}
							{genEntityIconHTMLElement(result.type)}{translate(`common:entityType.${_camelCase(result.type)}`)}
						</td>
					}
					<td>
						<a href={link}>
							{name} {disambiguation}
						</a>
						{
							toLower(result.type) === 'work' && Boolean(result.authors?.length) &&
							<span className="small text-muted"> — <i>{result.authors.join(', ')}</i></span>
						}
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
		if (noResults) {
			return null;
		}
		return (
			<div>
				{
					this.props.user ?
						<div>
							<AddToCollectionModal
								bbids={this.state.selected.map(getId)}
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
					<h3 className="search-results-heading">
						{translate('searchResults.heading')}
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
								<th width="25%">{translate('searchResults.headerType')}</th>
								<th width="42%">{translate('searchResults.headerName')}</th>
								<th width="33%">{translate('searchResults.headerAliases')}</th>
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
							className="margin-top-1"
							variant={this.state.message.type}
							onDismiss={this.handleAlertDismiss}
						>
							{this.state.message.text}
						</Alert> : null

				}
				{
					this.props.user ?
						<ButtonGroup>
							<Button
								disabled={!this.state.selected.length}
								type="button"
								variant="primary"
								onClick={this.handleAddToCollection}
							>
								{genEntityIconHTMLElement('Collection')}
								{translate('searchResults.addToCollection')}
							</Button>
							<Button
								disabled={!this.state.selected.length}
								type="button"
								variant="warning"
								onClick={this.handleClearSelected}
							>
								{translate('searchResults.clearSelected', {count: this.state.selected.length})}
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
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired,
	user: PropTypes.object.isRequired
};
SearchResults.defaultProps = {
	condensed: false,
	results: null
};

export default withTranslation(['pages', 'common'])(SearchResults);
