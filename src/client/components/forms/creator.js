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
/* eslint valid-jsdoc: ["error", { "requireReturn": false }] */

import * as bootstrap from 'react-bootstrap';
import Aliases from './parts/alias-list';
import CreatorData from './parts/creator-data';
import Icon from 'react-fontawesome';
import LoadingSpinner from '../loading-spinner';
import React from 'react';
import RevisionNote from './parts/revision-note';
import request from 'superagent-bluebird-promise';

const {Nav, NavItem, PageHeader} = bootstrap;

/**
* This is an extended class of the React Component to
* create and edit a creator
*/
class CreatorForm extends React.Component {
	/**
	* Binds the class methods to their respective data.
	* @constructor
	* @param {object} props - Object of properties passed in the constructor
	*/
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

	/**
	 * Changes to the selected tab of tab 'number' and checks validity
	 * of aliases and data.
	 * @param {number} tab - 'number' denotes the selected tab number
	 */
	handleTabSelect(tab) {
		this.setState({
			aliasesValid: this.aliases.valid(),
			dataValid: this.data.valid(),
			tab
		});
	}

	/**
	* Handler which directs the viewer to the previous tab
	*/
	handleBackClick() {
		this.handleTabSelect(this.state.tab - 1);
	}

	/**
	* Handler which directs the viewer to the next tab
	*/
	handleNextClick() {
		this.handleTabSelect(this.state.tab + 1);
	}

	/**
	* Handler which collects the creator information edited by the author
	*	and sends it to the server to be processed.
	* @param {object} evt - Event object passed in the Handler
	*/
	handleSubmit(evt) {
		evt.preventDefault();

		if (!(this.state.aliasesValid && this.state.dataValid)) {
			return;
		}

		const PENULTIMATE_ELEMENT = -1;
		const aliasData = this.aliases.getValue();
		const creatorData = this.data.getValue();
		const revisionNote = this.revision.note.getValue();
		const data = {
			aliases: aliasData.slice(0, PENULTIMATE_ELEMENT),
			annotation: creatorData.annotation,
			beginAreaId: parseInt(creatorData.beginArea, 10),
			beginDate: creatorData.beginDate,
			disambiguation: creatorData.disambiguation,
			endAreaId: parseInt(creatorData.endArea, 10),
			endDate: creatorData.endDate,
			ended: creatorData.ended,
			genderId: parseInt(creatorData.gender, 10),
			identifiers: creatorData.identifiers,
			note: revisionNote,
			typeId: parseInt(creatorData.creatorType, 10)
		};

		this.setState({waiting: true});

		request.post(this.props.submissionUrl)
			.send(data)
			.promise()
			.then((res) => {
				if (!res.body) {
					window.location.replace('/login');
					return;
				}
				const editionHref = `/creator/${res.body.bbid}`;
				if (res.body.alert) {
					const alertHref = `?alert=${res.body.alert}`;
					window.location.href = `${editionHref}${alertHref}`;
				}
				else {
					window.location.href = `${editionHref}`;
				}
			})
			.catch((error) => {
				this.setState({error});
			});
	}

	/**
	* Renders the document and allows the author to submit the data
	* Includes a loading spinner if there is delay in data display due to
	* connectivity.
	* @return {ReactElement} a HTML document which displays a creatoreditor
	*/
	render() {
		let aliases = null;
		const prefillData = this.props.creator;
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
				<PageHeader>
					{this.props.heading} <small>{this.props.subheading}</small>
				</PageHeader>

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
					<CreatorData
						creator={this.props.creator}
						creatorTypes={this.props.creatorTypes}
						genders={this.props.genders}
						identifierTypes={this.props.identifierTypes}
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

CreatorForm.displayName = 'CreatorForm';
CreatorForm.propTypes = {
	creator: React.PropTypes.object.isRequired,
	creatorTypes: React.PropTypes.array.isRequired,
	genders: React.PropTypes.array.isRequired,
	identifierTypes: React.PropTypes.array.isRequired,
	languages: React.PropTypes.array.isRequired,
	submissionUrl: React.PropTypes.string.isRequired
};

export default CreatorForm;
