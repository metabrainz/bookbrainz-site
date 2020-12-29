/*
 * Copyright (C) 2016  Daniel Hsing
 *               2016  Ben Ockmore
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

import * as bootstrap from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';


const {Col, Grid, Row} = bootstrap;

function Footer(props) {
	const {repositoryUrl, siteRevision} = props;

	return (
		<footer className="footer">
			<Grid fluid className="padding-top-1 padding-bottom-1">
				<Row >
					<Col xs={6} xsOffset={3}>
						<Row>
							<Col xs={2} >
								<a className="contact-text" href="//webchat.freenode.net/?channels=#metabrainz">
									<FontAwesomeIcon
										className="contact-text"
										icon="comment-dots"
										size="2x"
									/>
													IRC
								</a>
							</Col>
							<Col xs={2}>
								<a className="contact-text" href="//community.metabrainz.org/c/bookbrainz">
									<FontAwesomeIcon
										className="contact-text"
										icon="comments"
										size="2x"
									/>
													Forums
								</a>
							</Col>
							<Col xs={2}>
								<a className="contact-text" href="//twitter.com/intent/tweet?screen_name=BookBrainz">
									<FontAwesomeIcon
										className="contact-text"
										icon={['fab', 'twitter']}
										size="2x"
									/>
												Twitter
								</a>
							</Col>
							<Col xs={2}>
								<a className="contact-text" href="mailto:bookbrainz@metabrainz.org">
									<FontAwesomeIcon
										className="contact-text"
										icon="envelope"
										size="2x"
									/>
								Email
								</a>
							</Col>
						</Row>
					</Col>

				</Row>
				<Row className="bg-theme padding-top-1">
					<Col xs={6} >
						<Row>
							<Col xsOffset={1}>
								<div className="margin-top-1">
									<small>Cover image by{' '}
										<span>
											<a href="https://commons.wikimedia.org/wiki/File:Bookshelf.jpg">
											Stewart Butterfield
											</a>
										</span>
										<span>
											<a href="https://creativecommons.org/licenses/by/2.0/deed.en">
												CC-BY-2.0
											</a>
										</span>
									</small>
								</div>
								<div className="margin-top-1">
									<a href="/privacy">
										<small>Privacy & Terms</small>
									</a>
								</div>
							</Col>
						</Row>
					</Col>
					<Col xs={6}>
						<div className="margin-top-1 float-right">
							Alpha Software —{' '}
							<a href={`${repositoryUrl}commit/${siteRevision}`}>
								{siteRevision}
							</a> —&nbsp;
							<a href="https://tickets.metabrainz.org/projects/BB/issues/">
								Report a Bug
							</a>
						</div>
					</Col>
				</Row>
			</Grid>
		</footer>
	);
}

Footer.displayName = 'Footer';
Footer.propTypes = {
	repositoryUrl: PropTypes.string.isRequired,
	siteRevision: PropTypes.string.isRequired
};

export default Footer;
