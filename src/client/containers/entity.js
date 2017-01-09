/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2016  Max Prettyjohns
 * 				 2016  Ben Ockmore
 * 				 2016  Sean Burke
 *				 2015  Leo Verto
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
/* eslint indent: 0 */
const React = require('react');
const FontAwesome = require('react-fontawesome');
const formatDate = require('../helpers/utils').formatDate;

const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;
const Alert = require('react-bootstrap').Alert;
const Button = require('react-bootstrap').Button;
const Panel = require('react-bootstrap').Panel;

class EntityContainer extends React.Component {

	constructor(props) {
		super(props);
		this.renderAlert = this.renderAlert.bind(this);
	}

	renderAlert() {
		const {alert} = this.props;
		console.log(alert);
		return (
			<Row>
				<Col md={12}>
					<Alert bsStyle="info">
						<div>
							<strong>Achievement unlocked:</strong>
							{alert.map((achievement) =>
								<p
									key={achievement.id}
								>
								{achievement.name}
								</p>
							)}
						</div>
						<div>
							<strong>
								To showcase the badges for your new achievements
								go to your profile page
							</strong>
						</div>
					</Alert>
				</Col>
			</Row>
		);
	}

	renderHeader() {
		const {entity, iconName} = this.props;
		const entityType = entity.type.toLowerCase();
		const entityId = entity.bbid;
		const urlPrefix = `/${entityType}/${entityId}`;
		let entityLabel = null;
		if (entity.revision.dataId) {
			entityLabel = entity.defaultAlias ?
				`${entity.defaultAlias.name} ` :
					'(unnamed)';
		}
		else {
			entityLabel = `${entity.type} ${entity.bbid}`;
		}

		return (
			<Row>
				<Col md={12}>
					<h1>
						<Button
							bsStyle="primary"
							className="pull-right entity-action"
							href={`${urlPrefix}/revisions`}
							title="Revision History"
						>
							<FontAwesome
								fixedWidth
								name="history"
							/>
							{'  History'}
						</Button>
						{entity.revision.dataId && [
							<Button
								bsStyle="danger"
								className="pull-right entity-action"
								href={`${urlPrefix}/delete`}
								key="deleteButton"
								title="Delete Entity"
							>
								<FontAwesome
									fixedWidth
									name="remove"
								/>
								{'  Delete'}
							</Button>,
								<Button
									bsStyle="warning"
									className="pull-right entity-action"
									href={`${urlPrefix}/edit`}
									key="editButton"
									title="Edit Entity"
								>
									<FontAwesome
										fixedWidth
										name="pencil"
									/>
									{'  Edit'}
								</Button>
							]
						}
						<FontAwesome name={iconName}/>
						{' '}
						{entityLabel}
						{entity.disambiguation &&
							<small>
								{`(${entity.disambiguation.comment})`}
							</small>
						}
					</h1>
					<hr/>
				</Col>
			</Row>
		);
	}

	renderContent() {
		const {
			entity,
			iconName,
			identifierTypes,
			children,
			attributes
		} = this.props;
		if (entity.revision.dataId) {
			const editUrl =
				`/${entity.type.toLowerCase()}/${entity.bbid}/relationships`;
			const identifiers = entity.identifierSet &&
				identifierTypes.map((type) => {
					const identifierValues =
						entity.identifierSet.identifiers.filter((identifier) =>
							identifier.type.id === type.id
						).map((identifier, idx) =>
							<dd
								key={`${identifier.id}${idx}`}
							>
								{identifier.value}
								</dd>
						);
					return [
						<dt key={type.id}>{type.label}</dt>,
						identifierValues
					];
				});
			return (
				<Row>
					<Col
						md={4}
						mdPush={8}
					>
						<div className="text-center">
							<FontAwesome
								className="picture-fallback-icon-large"
								name={iconName}
							/>
						</div>
						<hr/>
						<dl>
							{attributes}
							<dt>Last Modified</dt>
							<dd>
								{formatDate(new Date(
									entity.revision.revision.createdAt
								))}
							</dd>
							{identifiers}
						</dl>
					</Col>
					<Col
						md={8}
						mdPull={4}
					>
						{entity.annotation &&
							<blockquote>
								<p>{entity.annotation.content}</p>
								<footer>
									{`updated ${formatDate(
										new Date(
										entity.annotation.lastRevision.createdAt
										)
									)}`}
								</footer>
							</blockquote>
						}
						{children}
						<h2>Relationships</h2>
						{entity.relationships &&
							<ul className="list-unstyled">
								{entity.relationships.map((relationship, idx) =>
									<li
										key={`relationship${idx}`}
									>
										{relationship.rendered}
									</li>
								)}
							</ul>
						}
						<Button
							bsStyle="warning"
							className="entity-action"
							href={editUrl}
						>
							<FontAwesome name="pencil"/>
							{' Edit'}
						</Button>
					</Col>
				</Row>
			);
		}
		return (
			<Row
				className="margin-top-2"
			>
				<Col
					md={6}
					mdOffset={3}
				>
					<Panel
						bsStyle="danger"
						header={`Deleted ${entity.type}`}
					>
						This entity has been deleted by an editor. This is most
						likely because it was added accidentally or
						incorrectly. If you're sure this entity should still
						exist, you will be able to undelete it in a future
						version of BookBrainz, but that's not quite ready yet.
					</Panel>
				</Col>
			</Row>
		);
	}

	render() {
		const {alert} = this.props;

		return (
			<div>
				{alert && this.renderAlert()}
				{this.renderHeader()}
				{this.renderContent()}
			</div>
		);
	}
}
EntityContainer.displayName = 'EntityContainer';
EntityContainer.propTypes = {
	alert: React.PropTypes.array,
	attributes: React.PropTypes.node,
	children: React.PropTypes.node,
	entity: React.PropTypes.object,
	iconName: React.PropTypes.string,
	identifierTypes: React.PropTypes.array
};

module.exports = EntityContainer;
