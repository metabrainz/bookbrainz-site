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

var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Select = require('../input/select2.jsx');
var LoadingSpinner = require('../loading_spinner.jsx');
var UUID = require('../input/uuid.jsx');
var extend = require('util')._extend;
var Promise = require('bluebird');

var request = require('superagent');
require('superagent-bluebird-promise');

var renderRelationship = require('../../../server/helpers/render.js');
var utils = require('../../../server/helpers/utils.js');
var SearchSelect = require('../input/entity-search.jsx');


module.exports = React.createClass({
	getInitialState: function() {
		'use strict';

		var targetEntity = this.props.targetEntity;
		targetEntity.key = 1;
		targetEntity.entity_gid = targetEntity.bbid;

		var loadedEntities = {};
		loadedEntities[targetEntity.bbid] = targetEntity;
		return {
			targetEntity: targetEntity,
			loadedEntities: loadedEntities,
			displayEntities: [targetEntity, {key: 2}],
			selectedRelationship: null,
			addedRelationships: [],
			addedRelationshipsSpawned: 0
		};
	},
	fetchEntity: function(uuid) {
		'use strict';

		// This should be modified to use bbws if the config can be separated from
		// that.
		return request.get(this.props.wsUrl + '/entity/' + uuid)
		.accept('application/json')
		.promise()
		.then(function(response) {
			return response.body;
		})
		.then(function(entity) {
			entity.bbid = entity.entity_gid;
			return request.get(entity.aliases_uri)
			.accept('application/json')
			.promise()
			.then(function(response) {
				return response.body;
			})
			.then(function(aliases) {
				entity.aliases = aliases.objects;
				return entity;
			});
		});
	},
	handleSubmit: function(e) {
		'use strict';

		var self = this;
		e.preventDefault();

		request.post('./relationships/handler')
		.send(this.state.addedRelationships.map(function(relationship) {
			return {
				id: [],
				relationship_type: {
					relationship_type_id: relationship.type.id
				},
				entities: relationship.entities.map(function(entity, index) {
					return {
						entity_gid: entity.bbid,
						position: index
					};
				})
			};
		}))
		.promise()
		.then(function(revision) {
			window.location.href = utils.getEntityLink(self.state.targetEntity);
		});
	},
	handleAdd: function(e) {
		'use strict';

		var addedRelationships = this.state.addedRelationships.slice();

		addedRelationships.push({
			type: this.state.selectedRelationship,
			entities: this.state.displayEntities,
			key: this.state.addedRelationshipsSpawned
		});

		this.state.addedRelationshipsSpawned++;

		this.setState({addedRelationships: addedRelationships});
	},
	handleSwap: function(i, e) {
		'use strict';

		var displayEntities = this.state.displayEntities.slice();
		displayEntities[i] = this.state.displayEntities[i + 1];
		displayEntities[i + 1] = this.state.displayEntities[i];

		this.setState({displayEntities: displayEntities});
	},
	setDisplayEntity: function(i, entity) {
		'use strict';

		entity.key = this.state.displayEntities[i].key;

		var displayEntities = this.state.displayEntities.slice();
		displayEntities[i] = entity;

		this.setState({displayEntities: displayEntities});
	},
	addLoadedEntity: function(entity) {
		'use strict';

		var loadedEntities = extend({}, this.state.loadedEntities);
		loadedEntities[entity.bbid] = entity;

		this.setState({loadedEntities: loadedEntities});
	},
	removeRelationship: function(i) {
		'use strict';

		var addedRelationships = this.state.addedRelationships.slice();

		addedRelationships.splice(i, 1);

		this.setState({addedRelationships: addedRelationships});
	},
	handleUUIDChange: function(i, e) {
		'use strict';

		var self = this;
		var bbid = this.refs[i].getValue();
		if (bbid !== this.state.targetEntity.bbid) {
			if (self.state.loadedEntities[bbid]) {
				self.setDisplayEntity(i, self.state.loadedEntities[bbid]);
			}
			else {
				this.fetchEntity(bbid)
				.then(function(entity) {
					self.addLoadedEntity(entity);
					self.setDisplayEntity(i, entity);
				});
			}
		}
		else {
			self.setDisplayEntity(i, {});
		}
	},
	handleRelationshipChange: function(e) {
		'use strict';

		var relationshipId = this.refs.relationship.getValue();
		var selectedRelationship = this.props.relationshipTypes.filter(function(relationship) {
			return relationship.id === relationshipId;
		});

		if (selectedRelationship.length !== 0) {
			this.setState({selectedRelationship: selectedRelationship[0]});
		}
		else {
			this.setState({selectedRelationship: null});
		}
	},
	render: function() {
		'use strict';

		var self = this;
		var loadingElement = this.state.waiting ? <LoadingSpinner/> : null;

		var select2Options = {
			width: '100%'
		};

		var renderedEntities = this.state.displayEntities.map(function(entity, i) {
			if (entity) {
				entity.id = entity.bbid;
				entity.text = entity.default_alias ? entity.default_alias.name : '(unnamed)';
			}

			return (
				<div className='form-group' key={entity.key}>
					<SearchSelect
						ref={i}
						label={'Entity ' + (i + 1)}
						labelAttribute='name'
						collection='entity'
						defaultValue={entity}
						placeholder='Select entity…'
						select2Options={select2Options}
						onChange={self.handleUUIDChange.bind(null, i)}
						labelClassName='col-md-4'
						wrapperClassName='col-md-4'
						disabled={entity === self.state.targetEntity}
						standalone />
					<div className='col-md-1'>
						<Button
							bsStyle='primary'
							className={(i === (self.state.displayEntities.length - 1)) ? 'hidden' : null}
							block
							onClick={self.handleSwap.bind(null, i)}>
							<span className='fa fa-exchange fa-rotate-90'/>
							<span className='sr-only'>Swap Entities</span>
						</Button>
					</div>
				</div>
			);
		});

		var relationshipDescription = null;
		if (this.state.selectedRelationship) {
			relationshipDescription = <Input
				type='static'
				wrapperClassName='col-md-4 col-md-offset-4'
				value={this.state.selectedRelationship.description} />;
		}

		var allEntitiesLoaded = this.state.displayEntities.every(function(entity) {
			return Boolean(entity.entity_gid);
		});

		// This could easily be a React component, and should be changed to
		// that at some point soon.
		var renderedRelationship = null;
		var addValid = false;
		if (allEntitiesLoaded && this.state.selectedRelationship) {
			renderedRelationship = {
				__html: renderRelationship(this.state.displayEntities, this.state.selectedRelationship, null)
			};
			addValid = true;
		}

		var relationshipEntry = (
			<div>
				<Select
					label='Type'
					labelAttribute='label'
					idAttribute='id'
					ref='relationship'
					placeholder='Select relationship type…'
					noDefault
					wrapperClassName='col-md-4'
					labelClassName='col-md-4'
					options={this.props.relationshipTypes}
					onChange={this.handleRelationshipChange}/>

				{relationshipDescription}

				{renderedEntities}

				<div className='text-center'>
					<p dangerouslySetInnerHTML={renderedRelationship} />
				</div>
				<div className='row'>
					<div className='col-md-4 col-md-offset-4'>
						<Button
							disabled={!addValid}
							title='Add Relationship'
							bsStyle='success'
							block
							onClick={this.handleAdd}
							>
							<span className='fa fa-plus'/>
							&nbsp;Add <span className='sr-only'>&nbsp;Relationship</span>
						</Button>
					</div>
				</div>
			</div>
		);

		var addedRelationships = this.state.addedRelationships.map(function(relationship, i) {
			var rendered = {
				__html: renderRelationship(relationship.entities, relationship.type, null)
			};
			return (
				<div className='row' key={relationship.key}>
					<div className='col-md-10' dangerouslySetInnerHTML={renderedRelationship} />
					<div className='col-md-2'>
						<Button
							bsStyle='danger'
							block
							onClick={self.removeRelationship.bind(null, i)}>
							<span className='fa fa-minus'/>
							<span className='sr-only'>Remove Relationship</span>
						</Button>
					</div>
				</div>
			);
		});

		return (
			<div>
				{loadingElement}
				<h2>Add Relationship</h2>
				<div className='row'>
					<div className='form-horizontal'>
						{relationshipEntry}
					</div>
				</div>
				<hr/>
				<h2>Added Relationships</h2>
				{addedRelationships}
				<hr/>
				<div className='row'>
					<div className='col-md-4 col-md-offset-4'>
						<Input
							bsStyle='success' block type='submit' value='Submit!' disabled={this.state.addedRelationships.length === 0} onClick={this.handleSubmit} />
					</div>
				</div>
			</div>
		);
	}
});
