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

const Aliases = require('./parts/aliases.jsx');
const RevisionNote = require('./parts/revisionNote.jsx');
const CreatorData = require('./parts/creatorData.jsx');
const LoadingSpinner = require('../loading_spinner.jsx');

const request = require('superagent');
require('superagent-bluebird-promise');

const Nav = require('react-bootstrap').Nav;
const NavItem = require('react-bootstrap').NavItem;

module.exports = React.createClass({
	displayName: 'creatorForm',
	propTypes: {
		creator: React.PropTypes.object,
		creatorTypes: React.PropTypes.array,
		genders: React.PropTypes.array,
		identifierTypes: React.PropTypes.array,
		languages: React.PropTypes.array,
		submissionUrl: React.PropTypes.string
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
			aliasesValid: this.refs.aliases.valid(),
			dataValid: this.refs.data.valid()
		});
	},
	backClick() {
		'use strict';

		this.setTab(this.state.tab - 1);
	},
	nextClick() {
		'use strict';

		this.setTab(this.state.tab + 1);
	},
	handleSubmit(evt) {
		'use strict';

		evt.preventDefault();

		if (!(this.state.aliasesValid && this.state.dataValid)) {
			return;
		}

		const aliasData = this.refs.aliases.getValue();
		const creatorData = this.refs.data.getValue();
		const revisionNote = this.refs.revision.refs.note.getValue();
		const data = {
			aliases: aliasData,
			beginDate: creatorData.beginDate,
			endDate: creatorData.endDate,
			ended: creatorData.ended,
			genderId: parseInt(creatorData.gender, 10),
			creatorTypeId: parseInt(creatorData.creatorType, 10),
			disambiguation: creatorData.disambiguation,
			annotation: creatorData.annotation,
			identifiers: creatorData.identifiers,
			note: revisionNote
		};

		this.setState({waiting: true});

		request.post(this.props.submissionUrl)
			.send(data).promise()
			.then((revision) => {
				if (!revision.body || !revision.body.entity) {
					window.location.replace('/login');
					return;
				}
				window.location.href =
					`/creator/${revision.body.entity.entity_gid}`;
			})
			.catch((error) => {
				this.setState({error});
			});
	},
	render() {
		'use strict';

		let aliases = null;
		const prefillData = this.props.creator;
		if (prefillData) {
			aliases = prefillData.aliases.map((alias) => ({
				id: alias.id,
				name: alias.name,
				sortName: alias.sort_name,
				language: alias.language ? alias.language.language_id : null,
				primary: alias.primary,
				default: alias.id === prefillData.default_alias.alias_id
			}));
		}

		const submitEnabled = this.state.aliasesValid && this.state.dataValid;

		const loadingElement = this.state.waiting ? <LoadingSpinner/> : null;

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
						<span className=
							{
								'text-danger fa fa-warning' +
								`${this.state.aliasesValid ? ' hidden' : ''}`
							}
						/>
					</NavItem>
					<NavItem eventKey={2}>
						<strong>2.</strong> Data
						<span className=
							{
								'text-danger fa fa-warning' +
								`${this.state.dataValid ? ' hidden' : ''}`
							}
						/>
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
						ref="aliases"
						visible={this.state.tab === 1}
					/>
					<CreatorData
						backClick={this.backClick}
						creator={this.props.creator}
						creatorTypes={this.props.creatorTypes}
						genders={this.props.genders}
						identifierTypes={this.props.identifierTypes}
						nextClick={this.nextClick}
						ref="data"
						visible={this.state.tab === 2}
					/>
					<RevisionNote
						backClick={this.backClick}
						onSubmit={this.handleSubmit}
						ref="revision"
						submitDisabled={!submitEnabled}
						visible={this.state.tab === 3}
					/>
				</form>
			</div>
		);
	}
});
