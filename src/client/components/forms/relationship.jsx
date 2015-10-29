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

const Input = require('react-bootstrap').Input;
const Button = require('react-bootstrap').Button;
const Select = require('../input/select2.jsx');
const LoadingSpinner = require('../loading_spinner.jsx');
const extend = require('util')._extend;

const request = require('superagent');
require('superagent-bluebird-promise');

const renderRelationship = require('../../../server/helpers/render.js');
const utils = require('../../../server/helpers/utils.js');
const SearchSelect = require('../input/entity-search.jsx');
const validators = require('../validators');

module.exports = React.createClass({
	displayName: 'relationshipForm',
	propTypes: {
		relationshipTypes:
			React.PropTypes.arrayOf(validators.relationshipType),
		targetEntity: React.PropTypes.shape({
			bbid: React.PropTypes.string,
			_type: React.PropTypes.string
		}),
		wsUrl: React.PropTypes.string
	},
	getInitialState() {
		'use strict';

		const targetEntity = this.props.targetEntity;
		targetEntity.key = 1;
		targetEntity.entity_gid = targetEntity.bbid;

		const loadedEntities = {};
		loadedEntities[targetEntity.bbid] = targetEntity;
		return {
			targetEntity,
			loadedEntities,
			displayEntities: [targetEntity, {key: 2}],
			selectedRelationship: null,
			addedRelationships: [],
			addedRelationshipsSpawned: 0
		};
	},
	fetchEntity(uuid) {
		'use strict';

		// This should be modified to use bbws if the config can be separated
		// from that.
		return request.get(`${this.props.wsUrl}/entity/${uuid}`)
		.accept('application/json')
		.promise()
		.then((response) => response.body)
		.then((entity) => {
			entity.bbid = entity.entity_gid;
			return request.get(entity.aliases_uri)
				.accept('application/json')
				.promise()
				.then((response) => response.body)
				.then((aliases) => {
					entity.aliases = aliases.objects;
					return entity;
				});
		});
	},
	handleSubmit(evt) {
		'use strict';

		const self = this;
		evt.preventDefault();

		request.post('./relationships/handler')
			.send(this.state.addedRelationships.map((relationship) => ({
				id: [],
				relationship_type: {
					relationship_type_id: relationship.type.id
				},
				entities: relationship.entities.map((entity, position) => ({
					entity_gid: entity.bbid,
					position
				}))
			})))
			.promise()
			.then(() => {
				window.location.href =
					utils.getEntityLink(self.state.targetEntity);
			});
	},
	handleAdd() {
		'use strict';

		const addedRelationships = this.state.addedRelationships.slice();

		addedRelationships.push({
			type: this.state.selectedRelationship,
			entities: this.state.displayEntities,
			key: this.state.addedRelationshipsSpawned
		});

		this.state.addedRelationshipsSpawned++;

		this.setState({addedRelationships});
	},
	handleSwap(i) {
		'use strict';

		const displayEntities = this.state.displayEntities.slice();
		displayEntities[i] = this.state.displayEntities[i + 1];
		displayEntities[i + 1] = this.state.displayEntities[i];

		this.setState({displayEntities});
	},
	setDisplayEntity(i, entity) {
		'use strict';

		entity.key = this.state.displayEntities[i].key;

		const displayEntities = this.state.displayEntities.slice();
		displayEntities[i] = entity;

		this.setState({displayEntities});
	},
	addLoadedEntity(entity) {
		'use strict';

		const loadedEntities = extend({}, this.state.loadedEntities);
		loadedEntities[entity.bbid] = entity;

		this.setState({loadedEntities});
	},
	removeRelationship(i) {
		'use strict';

		const addedRelationships = this.state.addedRelationships.slice();

		addedRelationships.splice(i, 1);

		this.setState({addedRelationships});
	},
	handleUUIDChange(i) {
		'use strict';

		const bbid = this.refs[i].getValue();
		if (bbid !== this.state.targetEntity.bbid) {
			if (this.state.loadedEntities[bbid]) {
				this.setDisplayEntity(i, this.state.loadedEntities[bbid]);
			}
			else {
				this.fetchEntity(bbid)
				.then((entity) => {
					this.addLoadedEntity(entity);
					this.setDisplayEntity(i, entity);
				});
			}
		}
		else {
			this.setDisplayEntity(i, {});
		}
	},
	handleRelationshipChange() {
		'use strict';

		const relationshipId = parseInt(this.refs.relationship.getValue(), 10);
		const selectedRelationship = this.props.relationshipTypes.filter(
			(relationship) => relationship.id === relationshipId
		);

		if (selectedRelationship.length !== 0) {
			this.setState({selectedRelationship: selectedRelationship[0]});
		}
		else {
			this.setState({selectedRelationship: null});
		}
	},
	render() {
		'use strict';

		const self = this;
		const loadingElement = this.state.waiting ? <LoadingSpinner/> : null;

		const select2Options = {
			width: '100%'
		};

		const renderedEntities = this.state.displayEntities.map((entity, i) => {
			if (entity) {
				entity.id = entity.bbid;
				entity.text = entity.default_alias ?
					entity.default_alias.name : '(unnamed)';
			}

			return (
				<div
					className="form-group"
					key={entity.key}
				>
					<SearchSelect
						collection="entity"
						defaultValue={entity}
						disabled={entity === self.state.targetEntity}
						label={`Entity ${i + 1}`}
						labelAttribute="name"
						labelClassName="col-md-4"
						onChange={self.handleUUIDChange.bind(null, i)}
						placeholder="Select entity…"
						ref={i}
						select2Options={select2Options}
						standalone
						wrapperClassName="col-md-4"
					/>
					<div className="col-md-1">
						<Button
							block
							bsStyle="primary"
							className={
								i === self.state.displayEntities.length - 1 ?
								'hidden' : null
							}
							onClick={self.handleSwap.bind(null, i)}
						>
							<span className="fa fa-exchange fa-rotate-90"/>
							<span className="sr-only">Swap Entities</span>
						</Button>
					</div>
				</div>
			);
		});

		let relationshipDescription = null;
		if (this.state.selectedRelationship) {
			relationshipDescription = (
				<Input
					type="static"
					value={this.state.selectedRelationship.description}
					wrapperClassName="col-md-4 col-md-offset-4"
				/>
			);
		}

		const allEntitiesLoaded = this.state.displayEntities.every(
			(entity) => Boolean(entity.entity_gid)
		);

		// This could easily be a React component, and should be changed to
		// that at some point soon.
		let currentRelationshipRendered = null;
		let addValid = false;
		if (allEntitiesLoaded && this.state.selectedRelationship) {
			currentRelationshipRendered = {
				__html: renderRelationship(
					this.state.displayEntities,
					this.state.selectedRelationship, null
				)
			};
			addValid = true;
		}

		const relationshipEntry = (
			<div>
				<Select
					idAttribute="id"
					label="Type"
					labelAttribute="label"
					labelClassName="col-md-4"
					noDefault
					onChange={this.handleRelationshipChange}
					options={this.props.relationshipTypes}
					placeholder="Select relationship type…"
					ref="relationship"
					wrapperClassName="col-md-4"
				/>

				{relationshipDescription}

				{renderedEntities}

				<div className="text-center">
					<p dangerouslySetInnerHTML={currentRelationshipRendered} />
				</div>
				<div className="row">
					<div className="col-md-4 col-md-offset-4">
						<Button
							block
							bsStyle="success"
							disabled={!addValid}
							onClick={this.handleAdd}
							title="Add Relationship"
						>
							<span className="fa fa-plus"/>
							&nbsp;Add
							<span className="sr-only">
								&nbsp;Relationship
							</span>
						</Button>
					</div>
				</div>
			</div>
		);

		const addedRelationships =
			this.state.addedRelationships.map((relationship, i) => {
				const renderedRelationship = {
					__html: renderRelationship(
						relationship.entities, relationship.type, null
					)
				};
				return (
					<div
						className="row"
						key={relationship.key}
					>
						<div
							className="col-md-10"
							dangerouslySetInnerHTML={renderedRelationship}
						/>
						<div className="col-md-2">
							<Button
								block
								bsStyle="danger"
								onClick={self.removeRelationship.bind(null, i)}
							>
								<span className="fa fa-minus"/>
								<span className="sr-only">
									Remove Relationship
								</span>
							</Button>
						</div>
					</div>
				);
			});

		return (
			<div>
				{loadingElement}
				<h2>Add Relationship</h2>
				<div className="row">
					<div className="form-horizontal">
						{relationshipEntry}
					</div>
				</div>
				<hr/>
				<h2>Added Relationships</h2>
				{addedRelationships}
				<hr/>
				<div className="row">
					<div className="col-md-4 col-md-offset-4">
						<Input
							block
							bsStyle="success"
							disabled=
								{this.state.addedRelationships.length === 0}
							onClick={this.handleSubmit}
							type="submit"
							value="Submit!"
						/>
					</div>
				</div>
			</div>
		);
	}
});
