/*
 * Copyright (C) 2015  Ben Ockmore
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

/*
 * Copyright (C) 2015  Ohm Patel
 *               2016  Sean Burke
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
const Alert = bootstrap.Alert;
const Grid = bootstrap.Grid;
const Row = bootstrap.Row;
const Col = bootstrap.Col;
const Button = bootstrap.Button;
const ListGroup = bootstrap.ListGroup;
const ListGroupItem = bootstrap.ListGroupItem;

const picture_classes = {
	Edition: 'fa-book',
	Publication: 'fa-th-list',
	Creator: 'fa-user',
	Publisher: 'fa-university',
	Work: 'fa-file-text-o'
};


class IndexPage extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.renderHeader = this.renderHeader.bind(this);
		this.renderContent = this.renderContent.bind(this);
	}

	renderHeader() {
		return (
			<div>
				<Alert bsStyle="warning" className="text-center">
					<p>Under development — adventurous users, please test and add data! Give us feedback about bugs,
					glitches and potential improvements at <a href="//tickets.musicbrainz.org/browse/BB">MusicBrainz JIRA!</a>
					</p>
				</Alert>
				<div id="background-image">
					<div className="text-center" id="background-overlay">
						<Grid>
							<img alt="BookBrainz logo" className="img-responsive center-block" src="/images/BookBrainz_text.svg" title="BookBrainz" width="500"/>
							<Row>
								<Col md={8} mdOffset={2}>
									<form action="/search" role="search">
										<div className="input-group input-group-lg margin-top-5">
											<input autoFocus="autofocus" className="form-control" name="q" placeholder="Search for..." type="text"/>
											<span className="input-group-btn">
												<Button bsStyle="success" type="submit"><span className="fa fa-search"/></Button>
											</span>
										</div>
									</form>
									<Row className="margin-top-4">
										<Col sm={4}><Button block bsSize="large" href="/about">About</Button></Col>
										<Col sm={4}><Button block bsSize="large" href="/contribute">Contribute</Button></Col>
										<Col sm={4}><Button block bsSize="large" href="/develop">Develop</Button></Col>
									</Row>
									<div className="margin-top-3">
										<h4 className="contact-text">Contact Us</h4>
										<span className="fa fa-circle margin-sides-1 contact-text"/>
										<a href="//webchat.freenode.net/?channels=#metabrainz">
											<span className="fa fa-comment fa-2x contact-text"/>
										</a>
										<span className="fa fa-circle margin-sides-1 contact-text"/>
										<a href="//twitter.com/intent/tweet?screen_name=BookBrainz">
											<span className="fa fa-twitter fa-2x contact-text"/>
										</a>
										<span className="fa fa-circle margin-sides-1 contact-text"/>
										<a href="mailto:bookbrainz-users@groups.io">
											<span className="fa fa-envelope fa-2x contact-text"/>
										</a>
										<span className="fa fa-circle margin-sides-1 contact-text"/>
									</div>
								</Col>
							</Row>
						</Grid>
					</div>
				</div>
			</div>
		);
	}

	renderContent() {
		const {recent} = this.props;

		return (
			<Grid>
				<Row>
					<Col md={8} mdOffset={2}>
						<h1 className="text-center">The Open Book Database</h1>
						<p className="lead text-justify">
							BookBrainz is a project to create an online database of information
							about every single book, magazine, journal and other publication ever
							written. We make all the data that we collect available to the whole
							world to consume and use as they see fit. Anyone can contribute to
							BookBrainz, whether through editing our information, helping out with
							development, or just spreading the word about our project.
						</p>
					</Col>
				</Row>
				<hr/>
				<Row>
					<Col className="text-center margin-top-4" md={2}><span className="fa fa-user fa-5x"/></Col>
					<Col md={10}>
						<h2>Join Us!</h2>
						<p className="lead">
							First off,&nbsp;<a href="/about" target="blank">read about us</a>&nbsp;and&nbsp;
							<a href="/contribute" target="blank">how you can help</a>.
							Then, if you think you want to stick around, hit the button
							below to sign up for a free BookBrainz account!
						</p>
					</Col>
				</Row>
				<div className="text-center margin-top-1 margin-bottom-3">
					<Button bsSize="large" bsStyle="success" href="/register">Register!</Button>
				</div>
				{recent &&
					<div>
						<hr/>
						<Row>
							<Col md={12}>
								<h2 className="text-center">Recent Activity</h2>
								<ListGroup>
									{recent.map((entity) => {
										const name = entity.defaultAlias ? entity.defaultAlias.name : '(unnamed)';
										return (
											<ListGroupItem href={`/revision/${entity.revisionId}`} key={entity.bbid} >
												<Row>
													<Col md={2}>{`r${entity.revisionId}`}</Col>
													<Col md={6}>
														<span className={`fa ${picture_classes[entity.type]}`}/>
														<span className="margin-left-1">{name}</span>
													</Col>
													<Col md={4}>
														{(new Date(Date.parse(entity.revision.revision.createdAt)).toLocaleDateString())}
													</Col>
												</Row>
											</ListGroupItem>
										);
									})}
								</ListGroup>
							</Col>
						</Row>
					</div>
				}
			</Grid>
		);
	}

	render() {
		return (
			<div>
				{this.renderHeader()}
				{this.renderContent()}
			</div>
		);
	}
}

IndexPage.displayName = 'IndexPage';
IndexPage.propTypes = {
	recent: React.PropTypes.array
};

module.exports = IndexPage;
