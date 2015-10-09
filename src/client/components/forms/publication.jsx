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

var React = require('react');

var Aliases = require('./parts/aliases.jsx');
var RevisionNote = require('./parts/revisionNote.jsx');
var PublicationData = require('./parts/publicationData.jsx');
var LoadingSpinner = require('../loading_spinner.jsx');

var request = require('superagent');
require('superagent-bluebird-promise');

var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;

module.exports = React.createClass({
	getInitialState: function() {
		'use strict';

		return {
			tab: 1,
			aliasesValid: true,
			dataValid: true,
			waiting: false
		};
	},
	setTab: function(tab) {
		'use strict';

		this.setState({
			tab: tab,
			aliasesValid: this.refs.aliases.valid(),
			dataValid: this.refs.data.valid()
		});
	},
	backClick: function() {
		'use strict';

		this.setTab(this.state.tab - 1);
	},
	nextClick: function() {
		'use strict';

		this.setTab(this.state.tab + 1);
	},
	handleTab: function(tabKey) {
		'use strict';

		this.setTab(tabKey);
	},
	handleSubmit: function(e) {
		'use strict';

		e.preventDefault();

		if (!(this.state.aliasesValid && this.state.dataValid)) {
			return;
		}

		var aliasData = this.refs.aliases.getValue();
		var publicationData = this.refs.data.getValue();
		var revisionNote = this.refs.revision.refs.note.getValue();
		var data = {
			aliases: aliasData,
			publicationTypeId: parseInt(publicationData.publicationType),
			disambiguation: publicationData.disambiguation,
			annotation: publicationData.annotation,
			identifiers: publicationData.identifiers,
			note: revisionNote
		};

		this.setState({waiting: true});

		var self = this;
		request.post(this.props.submissionUrl)
			.send(data).promise()
			.then(function(revision) {
				if (!revision.body || !revision.body.entity) {
					window.location.replace('/login');
					return;
				}
				window.location.href = '/publication/' + revision.body.entity.entity_gid;
			})
			.catch(function(err) {
				self.setState({error: err});
			});
	},
	render: function() {
		'use strict';

		var aliases = null;
		if (this.props.publication) {
			var self = this;
			aliases = this.props.publication.aliases.map(function(alias) {
				return {
					id: alias.id,
					name: alias.name,
					sortName: alias.sort_name,
					language: alias.language ? alias.language.language_id : null,
					primary: alias.primary,
					default: (alias.id === self.props.publication.default_alias.alias_id)
				};
			});
		}

		var submitEnabled = (this.state.aliasesValid && this.state.dataValid);

		var loadingElement = this.state.waiting ? <LoadingSpinner/> : null;

		return (
			<div>
				{loadingElement}

				<Nav bsStyle='tabs' activeKey={this.state.tab} onSelect={this.handleTab}>
					<NavItem eventKey={1}>
						<strong>1.</strong> Aliases <span className={'text-danger fa fa-warning' + (this.state.aliasesValid ? ' hidden' : '')} />
					</NavItem>
					<NavItem eventKey={2}>
						<strong>2.</strong> Data <span className={'text-danger fa fa-warning' + (this.state.dataValid ? ' hidden' : '')} />
					</NavItem>
					<NavItem eventKey={3}>
						<strong>3.</strong> Revision Note
					</NavItem>
				</Nav>


				<form onChange={this.handleChange}>
					<Aliases aliases={aliases} languages={this.props.languages} ref='aliases' nextClick={this.nextClick} visible={this.state.tab === 1}/>
					<PublicationData identifierTypes={this.props.identifierTypes} publication={this.props.publication} ref='data' publicationTypes={this.props.publicationTypes} backClick={this.backClick} nextClick={this.nextClick} visible={this.state.tab === 2}/>
					<RevisionNote backClick={this.backClick} ref='revision' visible={this.state.tab === 3} submitDisabled={!submitEnabled} onSubmit={this.handleSubmit}/>
				</form>
			</div>
		);
	}
});
