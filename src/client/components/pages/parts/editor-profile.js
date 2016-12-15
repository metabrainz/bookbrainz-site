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
const React = require('react');

const bootstrap = require('react-bootstrap');
const FontAwesome = require('react-fontawesome');

const Row = bootstrap.Row;
const Col = bootstrap.Col;
const Button = bootstrap.Button;
const Image = bootstrap.Image;

class EditorProfileTab extends React.Component {

	constructor(props) {
		super(props);
		this.renderBasicInfo = this.renderBasicInfo.bind(this);
		this.renderStats = this.renderStats.bind(this);
		this.renderBadges = this.renderBadges.bind(this);
	}

	renderBasicInfo() {
		const {user, editor} = this.props;
		const {cachedMetabrainzName, metabrainzUserId} = editor;
		const createdAtDate = (new Date(editor.createdAt)).toUTCString();
		const lastActiveDate = (new Date(editor.activeAt)).toUTCString();

		let musicbrainzAccount = 'No Linked MusicBrainz Account';
		if (cachedMetabrainzName) {
			musicbrainzAccount = (
				<a href={`http://musicbrainz.org/user/${cachedMetabrainzName}`}>
					{cachedMetabrainzName}
				</a>
			);
		}
		else if (metabrainzUserId) {
			musicbrainzAccount = metabrainzUserId;
		}
		else if (user && editor.id === user.id) {
			musicbrainzAccount =
				<a href="/auth">Link My MusicBrainz Account</a>;
		}

		return (
			<div>
				<h2>
					Basic Info
					{user && user.id === editor.id &&
						<small className="pull-right">
							<Button
								bsStyle="warning"
								className="entity-action"
								href="/editor/edit"
								title="Edit basic editor info"
							>
								<FontAwesome name="pencil"/>{' '}Edit Profile
							</Button>
						</small>
					}
				</h2>
				<dl className="dl-horizontal">
					<dt>MusicBrainz Account</dt>
					<dd>
					{musicbrainzAccount}
					</dd>
					<dt>Type</dt>
					<dd>{editor.type.label}</dd>
					<dt>Reputation</dt>
					<dd>0</dd>
					<dt>Joined</dt>
					<dd>{createdAtDate}</dd>
					<dt>Last Active</dt>
					<dd>{lastActiveDate}</dd>
					<dt>Bio</dt>
					<dd>{editor.bio ? editor.bio : '-'}</dd>
				</dl>
			</div>
		);
	}

	renderStats() {
		const {editor} = this.props;

		return (
			<div>
				<h2>Stats</h2>
				<dl className="dl-horizontal">
					<dt>Total Revisions</dt>
					<dd>{editor.totalRevisions}</dd>
					<dt>Revisions Applied</dt>
					<dd>{editor.revisionsApplied}</dd>
					<dt>Revisions Reverted</dt>
					<dd>{editor.revisionsReverted}</dd>
				</dl>
			</div>
		);
	}

	renderBadges() {
		const {achievement} = this.props;
		let achievementBsSize = 12;
		if (achievement.length === 1) {
			achievementBsSize = 8;
		}
		else if (achievement.length === 2) {
			achievementBsSize = 4;
		}

		return (
			<div>
				<h2>Badges</h2>
				<Row
					height="200px"
					margin="0"
					padding="0"
				>
					{achievement.model.map((model) =>
						<Col key={`achievementModel${model.id}`}
							 sm={4}
						>
							<div className="well">
								<Image
									className="center-block"
									height="100px"
									src={model.achievement.badgeUrl}
								/>
								<p className="text-center">
									{model.achievement.name}
								</p>
								<p className="text=center">
									{model.achievement.description}
								</p>
								<p className="text-center">
									{`unlocked: ${model.unlockedAt}`}
								</p>
							</div>
						</Col>
					)}
					{achievement.length < 3 &&
						<Col sm={achievementBsSize}>
							<div
								className="well"
								height="100%"
							>
								<Image
									className="center-block"
									height="160px"
									src="/images/sadface.png"
								/>
								<p className="text-center">
									No badge to show, use the achievement menu
									to see available achievements
								</p>
							</div>
						</Col>
					}
				</Row>
			</div>
		);
	}

	render() {
		return (
			<Row>
				<Col md={12}>
					{this.renderBasicInfo()}
					{this.renderStats()}
					{this.renderBadges()}
				</Col>
			</Row>
		);
	}
}

EditorProfileTab.displayName = 'EditorProfileTab';
EditorProfileTab.propTypes = {
	achievement: React.PropTypes.object,
	editor: React.PropTypes.object,
	user: React.PropTypes.object
};

module.exports = EditorProfileTab;
