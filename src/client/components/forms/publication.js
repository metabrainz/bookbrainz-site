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

const Icon = require('react-fontawesome');
const React = require('react');
const request = require('superagent-bluebird-promise');

const Nav = require('react-bootstrap').Nav;
const NavItem = require('react-bootstrap').NavItem;

const Aliases = require('./parts/alias-list');
const LoadingSpinner = require('../loading-spinner');
const PublicationData = require('./parts/publication-data');
const RevisionNote = require('./parts/revision-note');

class PublicationForm extends React.Component {

	/**
	 * Initializes component state to default values and binds class
	 * methods to proper context so that they can be directly invoked
	 * without explicit binding
	 *
	 * @param {object} props - Properties object passed down from parents
	 */
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

	/**
	 * Changes the selected tab and refreshes validity
	 * of aliases form into state
	 *
	 * @param {number} tab - Indicates the selected tab
	 */
	handleTabSelect(tab) {
		this.setState({
			tab,
			aliasesValid: this.aliases.valid()
		});
	}

	/**
	 * Event handler that moves user to previous tab
	 *
	 */
	handleBackClick() {
		this.handleTabSelect(this.state.tab - 1);
	}

	/**
	 * Event handler that moves user to following tab
	 *
	 */
	handleNextClick() {
		this.handleTabSelect(this.state.tab + 1);
	}

	/**
	 * Extracts user revisions to publications and sends it to the server
	 * to be saved
	 *
	 * @param {object} evt - Event object passed in by event dispatcher
	 */
	handleSubmit(evt) {
		evt.preventDefault();

		if (!(this.state.aliasesValid && this.state.dataValid)) {
			return;
		}

		const aliasData = this.aliases.getValue();
		const publicationData = this.data.getValue();
		const revisionNote = this.revision.note.getValue();
		const data = {
			aliases: aliasData.slice(0, -1),
			typeId: parseInt(publicationData.publicationType, 10),
			disambiguation: publicationData.disambiguation,
			annotation: publicationData.annotation,
			identifiers: publicationData.identifiers,
			note: revisionNote
		};

		this.setState({waiting: true});

		request.post(this.props.submissionUrl)
			.send(data).promise()
			.then((res) => {
				if (!res.body) {
					window.location.replace('/login');
					return;
				}
				const editionHref = `/publication/${res.body.bbid}`;
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
	 * Renders the component: Includes a top nav bar, 3 forms that change
	 * visibility based the 'tab' state variable, and a loading spinner that
	 * appears for certain async operations
	 *
	 * @returns {object} - JSX to render
	 */
	render() {
		let aliases = null;
		const prefillData = this.props.publication;
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

		const loadingElement =
			this.state.waiting ? <LoadingSpinner/> : null;

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
					<PublicationData
						identifierTypes={this.props.identifierTypes}
						publication={this.props.publication}
						publicationTypes={this.props.publicationTypes}
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

PublicationForm.displayName = 'PublicationForm';
PublicationForm.propTypes = {
	identifierTypes: React.PropTypes.array,
	languages: React.PropTypes.array,
	publication: React.PropTypes.object,
	publicationTypes: React.PropTypes.array,
	submissionUrl: React.PropTypes.string
};

module.exports = PublicationForm;
