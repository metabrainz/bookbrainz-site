/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2016  Ben Ockmore
 * 				 2016  Max Prettyjohns
 * 				 2016  Sean Burke
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

import * as bootstrap from 'react-bootstrap';
import * as utilsHelper from '../../../helpers/utils';
import {faExternalLinkAlt, faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {keys, values} from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Line} from 'react-chartjs-2';
import PropTypes from 'prop-types';
import React from 'react';
import {withTranslation} from 'react-i18next';
/* eslint-disable-next-line import/no-unassigned-import,sort-imports -- import this after react-chartjs-2 */
import 'chartjs-adapter-date-fns';


const {Button, Card, Col, Image, ListGroup, Row} = bootstrap;
const {formatDate} = utilsHelper;

class EditorProfileTab extends React.Component {
	constructor(props) {
		super(props);
		this.renderActivityGraph = this.renderActivityGraph.bind(this);
		this.renderBasicInfo = this.renderBasicInfo.bind(this);
		this.renderStats = this.renderStats.bind(this);
		this.renderBadges = this.renderBadges.bind(this);
	}

	renderBasicInfo() {
		// eslint-disable-next-line id-length
		const {t: translate, user, editor} = this.props;
		const {
			cachedMetabrainzName,
			metabrainzUserId,
			name,
			gender
		} = editor;
		const createdAtDate = formatDate(new Date(editor.createdAt), true);
		const lastActiveDate = formatDate(new Date(editor.activeAt), true);

		let musicbrainzAccount = translate('pages:profile.noLinkedMB');
		if (cachedMetabrainzName) {
			musicbrainzAccount = (
				<span>
					<a href={`http://musicbrainz.org/user/${cachedMetabrainzName}`}>
						{cachedMetabrainzName}
					</a>
					&nbsp;(
					<a
						href={`http://musicbrainz.org/user/${cachedMetabrainzName}/contact`}
						rel="noopener noreferrer"
						target="_blank"
					>
						{translate('pages:profile.sendEmail')} <FontAwesomeIcon icon={faExternalLinkAlt}/>
					</a>)
				</span>
			);
		}
		else if (metabrainzUserId) {
			musicbrainzAccount = metabrainzUserId;
		}
		else if (user && editor.id === user.id) {
			musicbrainzAccount =
				<a href="/auth">{translate('pages:profile.linkMB')}</a>;
		}

		return (
			<div>
				<h2>
					{translate('pages:profile.basicInfo')}
					{user && user.id === editor.id &&
						<small className="float-right">
							<Button
								href="/editor/edit"
								title={translate('pages:profile.editInfoTitle')}
								variant="warning"
							>
								<FontAwesomeIcon icon={faPencilAlt}/>{' '}{translate('pages:profile.editProfile')}
							</Button>
						</small>
					}
				</h2>
				<dl className="row editor-info">
					<dt className="col-md-2">{translate('pages:profile.musicbrainzAccount')}</dt>
					<dd className="col-md-10">
						{musicbrainzAccount}
					</dd>
					<dt className="col-md-2">{translate('pages:profile.displayName')}</dt>
					<dd className="col-md-10">{name}</dd>
					<dt className="col-md-2">{translate('common:area')}</dt>
					<dd className="col-md-10">{editor.area ? editor.area.name : '?'}</dd>
					<dt className="col-md-2">{translate('common:gender')}</dt>
					<dd className="col-md-10">{gender ? gender.name : '?'}</dd>
					<dt className="col-md-2">{translate('common:type')}</dt>
					<dd className="col-md-10">{editor.type.label}</dd>
					<dt className="col-md-2">{translate('pages:profile.reputation')}</dt>
					<dd className="col-md-10">0</dd>
					<dt className="col-md-2">{translate('pages:profile.joined')}</dt>
					<dd className="col-md-10">{createdAtDate}</dd>
					<dt className="col-md-2">{translate('pages:profile.lastLogin')}</dt>
					<dd className="col-md-10">{lastActiveDate}</dd>
					<dt className="col-md-2">{translate('pages:profile.bio')}</dt>
					<dd className="col-md-10">{editor.bio ? editor.bio : '-'}</dd>
				</dl>
			</div>
		);
	}

	renderStats() {
		// eslint-disable-next-line id-length
		const {t: translate, editor} = this.props;

		return (
			<div>
				<h2>{translate('pages:profile.stats')}</h2>
				<dl className="row editor-info">
					<dt className="col-md-8">{translate('pages:profile.totalRevisions')}</dt>
					<dd className="col-md-4">{editor.totalRevisions}</dd>
					<dt className="col-md-8">{translate('pages:profile.revisionsApplied')}</dt>
					<dd className="col-md-4">{editor.revisionsApplied}</dd>
					<dt className="col-md-8">{translate('pages:profile.revisionsReverted')}</dt>
					<dd className="col-md-4">{editor.revisionsReverted}</dd>
				</dl>
			</div>
		);
	}

	renderBadges() {
		// eslint-disable-next-line id-length
		const {t: translate, achievement} = this.props;
		let achievementBsSize = 12;
		if (achievement.length === 1) {
			achievementBsSize = 8;
		}
		else if (achievement.length === 2) {
			achievementBsSize = 4;
		}

		return (
			<div>
				<h2>{translate('pages:profile.badges')}</h2>
				<Row
					height="200px"
					margin="0"
					padding="0"
				>
					{achievement.model.map((model) => (
						<Col key={`achievementModel${model.id}`} md={4}>
							<Card bg="light">
								<Card.Img
									className="mt-3 mb-2"
									height={100}
									src={model.achievement.badgeUrl}
									variant="top"
								/>
								<Card.Body className="text-center">
									<ListGroup variant="flush">
										<ListGroup.Item>{model.achievement.name}</ListGroup.Item>
										<ListGroup.Item>{model.achievement.description}</ListGroup.Item>
										<ListGroup.Item>
											{translate('pages:profile.unlocked', {
												date: formatDate(new Date(model.unlockedAt), true)
											})}
										</ListGroup.Item>
									</ListGroup>
								</Card.Body>
							</Card>
						</Col>
					))}
					{achievement.length < 3 &&
						<Col md={achievementBsSize}>
							<Card bg="light" className="justify-content-center">
								<Image
									className="ml-auto mr-auto"
									height="160px"
									src="/images/sadface.png"
									width="160px"
								/>
								<p className="text-center">
									{translate('pages:profile.noBadges')}
								</p>
							</Card>
						</Col>
					}
				</Row>
			</div>
		);
	}

	renderActivityGraph() {
		const {activityData, totalRevisions} = this.props.editor;
		const months = keys(activityData);
		const numberOfRevisions = values(activityData);

		if (!totalRevisions) {
			return null;
		}

		const data = {
			datasets: [
				{
					backgroundColor: 'rgba(235,116,59,0.2)',
					borderColor: 'rgba(235,116,59,1)',
					borderWidth: 1,
					data: numberOfRevisions,
					hoverBackgroundColor: 'rgba(235,116,59,0.4)',
					hoverBorderColor: 'rgba(235,116,59,1)',
					// eslint-disable-next-line id-length
					label: this.props.t('pages:profile.revisionsChartLabel')
				}
			],
			labels: months
		};

		return (
			<div>
				<Line
					data={data}
					options={{
						responsive: true
					}}
				/>
			</div>
		);
	}

	render() {
		return (
			<Row>
				<Col lg={12}>
					{this.renderBasicInfo()}
				</Col>
				<Col lg={3}>
					{this.renderStats()}
				</Col>
				<Col lg={9}>
					{this.renderActivityGraph()}
				</Col>
				<Col lg={12}>
					{this.renderBadges()}
				</Col>
			</Row>
		);
	}
}

EditorProfileTab.displayName = 'EditorProfileTab';
EditorProfileTab.propTypes = {
	achievement: PropTypes.object.isRequired,
	editor: PropTypes.object.isRequired,
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired,
	user: PropTypes.object
};
EditorProfileTab.defaultProps = {
	user: null
};

export default withTranslation(['pages', 'common'])(EditorProfileTab);
