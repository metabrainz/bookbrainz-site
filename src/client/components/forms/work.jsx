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
const Icon = require('react-fontawesome');

const Aliases = require('./parts/aliases.jsx');
const RevisionNote = require('./parts/revisionNote.jsx');
const WorkData = require('./parts/workData.jsx');
const LoadingSpinner = require('../loading_spinner.jsx');

const request = require('superagent');
require('superagent-bluebird-promise');

const Nav = require('react-bootstrap').Nav;
const NavItem = require('react-bootstrap').NavItem;

module.exports = React.createClass({
	displayName: 'workForm',
	propTypes: {
		identifierTypes: React.PropTypes.array,
		languages: React.PropTypes.array,
		submissionUrl: React.PropTypes.string,
		work: React.PropTypes.object,
		workTypes: React.PropTypes.array
	},
	getInitialState() {
		'use strict';

		return {
			tab: 1,
			aliasesValid: true,
			dataValid: true,
			waiting: false
		};
	},
	setTab(tab) {
		'use strict';

		this.setState({
			tab,
			aliasesValid: this.aliases.valid(),
			dataValid: this.data.valid()
		});
	},
	backClick(evt) {
		'use strict';

		evt.preventDefault();
		this.setTab(this.state.tab - 1);
	},
	nextClick(evt) {
		'use strict';

		evt.preventDefault();
		this.setTab(this.state.tab + 1);
	},
	handleSubmit(evt) {
		'use strict';

		evt.preventDefault();

		if (!(this.state.aliasesValid && this.state.dataValid)) {
			return;
		}

		const aliasData = this.aliases.getValue();
		const workData = this.data.getValue();
		const revisionNote = this.revision.note.getValue();

		const data = {
			aliases: aliasData.slice(0, -1),
			languages: workData.languages.map(
				(languageId) => parseInt(languageId, 10)
			),
			typeId: parseInt(workData.workType, 10),
			disambiguation: workData.disambiguation,
			annotation: workData.annotation,
			identifiers: workData.identifiers,
			note: revisionNote
		};

		this.setState({waiting: true});

		const self = this;
		request.post(this.props.submissionUrl)
			.send(data).promise()
			.then((res) => {
				if (!res.body) {
					window.location.replace('/login');
					return;
				}
				window.location.href = `/work/${res.body.bbid}`;
			})
			.catch((error) => {
				self.setState({error});
			});
	},
	render() {
		'use strict';

		let aliases = null;
		const prefillData = this.props.work;
		if (prefillData) {
			aliases = prefillData.aliasSet.aliases.map((alias) => (
				{
					id: alias.id,
					name: alias.name,
					sortName: alias.sortName,
					languageId: alias.languageId,
					primary: alias.primary,
					default: alias.id === prefillData.defaultAlias.id
				}
			));
		}

		const submitEnabled = this.state.aliasesValid && this.state.dataValid;

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
					onSelect={this.setTab}
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
						nextClick={this.nextClick}
						ref={(ref) => this.aliases = ref}
						visible={this.state.tab === 1}
					/>
					<WorkData
						backClick={this.backClick}
						identifierTypes={this.props.identifierTypes}
						languages={this.props.languages}
						nextClick={this.nextClick}
						ref={(ref) => this.data = ref}
						visible={this.state.tab === 2}
						work={this.props.work}
						workTypes={this.props.workTypes}
					/>
					<RevisionNote
						backClick={this.backClick}
						ref={(ref) => this.revision = ref}
						submitDisabled={!submitEnabled}
						visible={this.state.tab === 3}
						onSubmit={this.handleSubmit}
					/>
				</form>
			</div>
		);
	}
});
