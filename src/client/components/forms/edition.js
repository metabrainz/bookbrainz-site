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

import * as bootstrap from 'react-bootstrap';
import Aliases from './parts/alias-list';
import EditionData from './parts/edition-data';
import Icon from 'react-fontawesome';
import LoadingSpinner from '../loading-spinner';
import React from 'react';
import RevisionNote from './parts/revision-note';
import request from 'superagent-bluebird-promise';

const {Nav, NavItem} = bootstrap;

class EditionForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			aliasesValid: true,
			dataValid: true,
			tab: 1,
			waiting: false
		};

		// React does not autobind non-React class methods
		this.handleTabSelect = this.handleTabSelect.bind(this);
		this.handleBackClick = this.handleBackClick.bind(this);
		this.handleNextClick = this.handleNextClick.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleTabSelect(tab) {
		this.setState({
			aliasesValid: this.aliases.valid(),
			dataValid: this.data.valid(),
			tab
		});
	}

	handleBackClick() {
		this.handleTabSelect(this.state.tab - 1);
	}

	handleNextClick() {
		this.handleTabSelect(this.state.tab + 1);
	}

	handleSubmit(evt) {
		evt.preventDefault();

		if (!(this.state.aliasesValid && this.state.dataValid)) {
			return;
		}

		const PENULTIMATE_ELEMENT = -1;
		const aliasData = this.aliases.getValue();
		const editionData = this.data.getValue();
		const revisionNote = this.revision.note.getValue();
		const data = {
			aliases: aliasData.slice(0, PENULTIMATE_ELEMENT),
			annotation: editionData.annotation,
			depth: parseInt(editionData.depth, 10),
			disambiguation: editionData.disambiguation,
			formatId: parseInt(editionData.editionFormat, 10),
			height: parseInt(editionData.height, 10),
			identifiers: editionData.identifiers,
			languages: editionData.languages,
			note: revisionNote,
			pages: parseInt(editionData.pages, 10),
			publicationBbid: editionData.publication,
			publishers: editionData.publishers,
			releaseEvents: editionData.releaseEvents,
			statusId: parseInt(editionData.editionStatus, 10),
			weight: parseInt(editionData.weight, 10),
			width: parseInt(editionData.width, 10)
		};

		this.setState({waiting: true});

		const self = this;
		request.post(this.props.submissionUrl)
			.send(data)
			.promise()
			.then((res) => {
				if (!res.body) {
					window.location.replace('/login');
					return;
				}
				const editionHref = `/edition/${res.body.bbid}`;
				if (res.body.alert) {
					const alertHref = `?alert=${res.body.alert}`;
					window.location.href = `${editionHref}${alertHref}`;
				}
				else {
					window.location.href = `${editionHref}`;
				}
			})
			.catch((error) => {
				self.setState({error});
			});
	}

	render() {
		let aliases = null;
		const prefillData = this.props.edition;
		if (prefillData) {
			aliases = prefillData.aliasSet.aliases.map((alias) => ({
				default: alias.id === prefillData.defaultAlias.id,
				id: alias.id,
				languageId: alias.languageId,
				name: alias.name,
				primary: alias.primary,
				sortName: alias.sortName
			}));
		}

		const submitEnabled =
			this.state.aliasesValid && this.state.dataValid;

		const loadingElement = this.state.waiting ? <LoadingSpinner/> : null;

		const invalidIcon = (
			<span>&nbsp;
				<Icon
					className="text-danger"
					name="warning"
				/>
			</span>
		);

		return (
			<div>
				{loadingElement}

				<Nav
					activeKey={this.state.tab}
					bsStyle="tabs"
					onSelect={this.handleTabSelect}
				>
					<NavItem eventKey={1}>
						<strong>1.</strong> Aliases
						{this.state.aliasesValid || invalidIcon}
					</NavItem>
					<NavItem eventKey={2}>
						<strong>2.</strong> Data
						{this.state.dataValid || invalidIcon}
					</NavItem>
					<NavItem eventKey={3}>
						<strong>3.</strong> Revision Note
					</NavItem>
				</Nav>


				<form onChange={this.handleChange}>
					<Aliases
						aliases={aliases}
						languages={this.props.languages}
						ref={(ref) => this.aliases = ref}
						visible={this.state.tab === 1}
						onNextClick={this.handleNextClick}
					/>
					<EditionData
						edition={this.props.edition}
						editionFormats={this.props.editionFormats}
						editionStatuses={this.props.editionStatuses}
						identifierTypes={this.props.identifierTypes}
						languages={this.props.languages}
						publication={this.props.publication}
						publisher={this.props.publisher}
						ref={(ref) => this.data = ref}
						visible={this.state.tab === 2}
						onBackClick={this.handleBackClick}
						onNextClick={this.handleNextClick}
					/>
					<RevisionNote
						ref={(ref) => this.revision = ref}
						submitDisabled={!submitEnabled}
						visible={this.state.tab === 3}
						onBackClick={this.handleBackClick}
						onSubmit={this.handleSubmit}
					/>
				</form>
			</div>
		);
	}
}

EditionForm.displayName = 'EditionForm';
EditionForm.propTypes = {
	edition: React.PropTypes.object.isRequired,
	editionFormats: React.PropTypes.array.isRequired,
	editionStatuses: React.PropTypes.array.isRequired,
	identifierTypes: React.PropTypes.array.isRequired,
	languages: React.PropTypes.array.isRequired,
	publication: React.PropTypes.object,
	publisher: React.PropTypes.object,
	submissionUrl: React.PropTypes.string.isRequired
};
EditionForm.defaultProps = {
	publication: null,
	publisher: null
};

export default EditionForm;
