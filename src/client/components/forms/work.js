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
const RevisionNote = require('./parts/revision-note');
const WorkData = require('./parts/work-data');

/**
 * React component to define a form to create and edit
 * a Work.
 * @extends React.Component
 */
class WorkForm extends React.Component {
	/**
	 * Binds class methods to their respective data.
	 * @param {object} props - Properties passed into the constructor
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
	 * Changes to the tab selected by the user, which has the number
	 * in 'tab', and checks the validity of the alias and other data.
	 * @param {number} tab - the number of the selected tab
	 */
	handleTabSelect(tab) {
		this.setState({
			aliasesValid: this.aliases.valid(),
			dataValid: this.data.valid(),
			tab
		});
	}

	/**
	 * Handler to direct the user to the previous tab.
	 * @param {Event} evt - used to prevent event propagation
	 */
	handleBackClick(evt) {
		evt.preventDefault();
		this.handleTabSelect(this.state.tab - 1);
	}

	/**
         * Handler to direct the user to the next tab.
         * @param {Event} evt - used to prevent event propagation
         */
	handleNextClick(evt) {
		evt.preventDefault();
		this.handleTabSelect(this.state.tab + 1);
	}

	/**
         * Handler to send work information in the form to the server.
         * @param {Event} evt - used to prevent event propagation
         */
	handleSubmit(evt) {
		evt.preventDefault();

		if (!(this.state.aliasesValid && this.state.dataValid)) {
			return;
		}

		// Collect form data
		const aliasData = this.aliases.getValue();
		const workData = this.data.getValue();
		const revisionNote = this.revision.note.getValue();

		const PENULTIMATE_ELEMENT = -1;
		const data = {
			aliases: aliasData.slice(0, PENULTIMATE_ELEMENT),
			annotation: workData.annotation,
			disambiguation: workData.disambiguation,
			identifiers: workData.identifiers,
			languages: workData.languages.map(
				(languageId) => parseInt(languageId, 10)
			),
			note: revisionNote,
			typeId: parseInt(workData.workType, 10)
		};

		// Shows a loading spinner in render()
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
				const editionHref = `/work/${res.body.bbid}`;
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

	/**
	 * Renders the form component to allow the user to input
	 * and submit data about a Work. Also shows a loading spinner
	 * if connectivity causes a delay in submission.
	 * @return {ReactElement} - React element corresponding to the
	 * rendered WorkEditor component
	 */
	render() {
		let aliases = null;
		const prefillData = this.props.work;
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
					<WorkData
						identifierTypes={this.props.identifierTypes}
						languages={this.props.languages}
						ref={(ref) => this.data = ref}
						visible={this.state.tab === 2}
						work={this.props.work}
						workTypes={this.props.workTypes}
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

WorkForm.displayName = 'WorkForm';
WorkForm.propTypes = {
	identifierTypes: React.PropTypes.array,
	languages: React.PropTypes.array,
	submissionUrl: React.PropTypes.string,
	work: React.PropTypes.object,
	workTypes: React.PropTypes.array
};

module.exports = WorkForm;
