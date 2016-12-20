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

const Icon = require('react-fontawesome');
const React = require('react');
const request = require('superagent-bluebird-promise');

const Nav = require('react-bootstrap').Nav;
const NavItem = require('react-bootstrap').NavItem;

const Aliases = require('./parts/alias-list');
const RevisionNote = require('./parts/revision-note');
const EditionData = require('./parts/edition-data');
const LoadingSpinner = require('../loading-spinner');

class EditionForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			tab: 1,
			aliasesValid: true,
			dataValid: true,
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
			tab,
			aliasesValid: this.aliases.valid(),
			dataValid: this.data.valid()
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
			publicationBbid: editionData.publication,
			publishers: editionData.publishers,
			releaseEvents: editionData.releaseEvents,
			languages: editionData.languages,
			formatId: parseInt(editionData.editionFormat, 10),
			statusId: parseInt(editionData.editionStatus, 10),
			disambiguation: editionData.disambiguation,
			annotation: editionData.annotation,
			identifiers: editionData.identifiers,
			pages: parseInt(editionData.pages, 10),
			weight: parseInt(editionData.weight, 10),
			width: parseInt(editionData.width, 10),
			height: parseInt(editionData.height, 10),
			depth: parseInt(editionData.depth, 10),
			note: revisionNote
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
				id: alias.id,
				name: alias.name,
				sortName: alias.sortName,
				languageId: alias.languageId,
				primary: alias.primary,
				default: alias.id === prefillData.defaultAlias.id
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
	edition: React.PropTypes.object,
	editionFormats: React.PropTypes.array,
	editionStatuses: React.PropTypes.array,
	identifierTypes: React.PropTypes.array,
	languages: React.PropTypes.array,
	publication: React.PropTypes.object,
	publisher: React.PropTypes.object,
	submissionUrl: React.PropTypes.string
};

module.exports = EditionForm;
