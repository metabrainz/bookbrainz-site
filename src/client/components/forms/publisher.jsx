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

const Aliases = require('./parts/alias-list.jsx');
const LoadingSpinner = require('../loading-spinner.jsx');
const PublisherData = require('./parts/publisher-data.jsx');
const RevisionNote = require('./parts/revision-note.jsx');

(() => {
	'use strict';

	class PublisherForm extends React.Component {
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

			const aliasData = this.aliases.getValue();
			const publisherData = this.data.getValue();
			const revisionNote = this.revision.note.getValue();
			const data = {
				aliases: aliasData.slice(0, -1),
				beginDate: publisherData.beginDate,
				endDate: publisherData.endDate,
				ended: publisherData.ended,
				typeId: parseInt(publisherData.publisherType, 10),
				disambiguation: publisherData.disambiguation,
				annotation: publisherData.annotation,
				identifiers: publisherData.identifiers,
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
					window.location.href = `/publisher/${res.body.bbid}`;
				})
				.catch((error) => {
					this.setState({error});
				});
		}

		render() {
			let aliases = null;
			const prefillData = this.props.publisher;
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
						<PublisherData
							identifierTypes={this.props.identifierTypes}
							publisher={this.props.publisher}
							publisherTypes={this.props.publisherTypes}
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

	PublisherForm.displayName = 'PublisherForm';
	PublisherForm.propTypes = {
		identifierTypes: React.PropTypes.array,
		languages: React.PropTypes.array,
		publisher: React.PropTypes.object,
		publisherTypes: React.PropTypes.array,
		submissionUrl: React.PropTypes.string
	};

	module.exports = PublisherForm;
})();
