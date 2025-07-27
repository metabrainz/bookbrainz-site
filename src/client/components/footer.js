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

import * as React from 'react';
import * as bootstrap from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import {faAnglesRight} from '@fortawesome/free-solid-svg-icons';


const {Col, Container, Row} = bootstrap;

function Footer(props) {
	const {repositoryUrl, siteRevision} = props;

	return (
		<footer className="footer">
			<Container fluid>
				<Row>
					<Col md={6} sm={12}>
						<h3>
							<img
								alt="BookBrainz"
								src="/images/BookBrainz_logo.svg"
								width="190"
							/>
						</h3>
						<br/>
						<p className="color-gray">
              BookBrainz is a project to create an online database of information about every single book, magazine, journal,
              and other publication ever written. It is an online encyclopedia containing information about published literature.
						</p>
						<ul className="list-unstyled">
							<li className="color-a">
								<span className="color-gray">Chat with us: </span>{' '}
								<a
									href="https://musicbrainz.org/doc/Communication/ChatBrainz"
									rel="noopener noreferrer"
									target="_blank"
								>
                  Matrix, IRC, Discord
								</a>
							</li>
							<li className="color-a">
								<span className="color-gray">Email: </span>{' '}
								<a href="mailto:support@metabrainz.org">
                  support@metabrainz.org{' '}
								</a>
							</li>
						</ul>
					</Col>
					<br/>
					<Col md={3} sm={6} xs={12}>
						<h3 className="w-title-a text-brand">Useful Links</h3>
						<ul className="list-unstyled">
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<a href="./donate/">Donate</a>
							</li>
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<a
									href="https://wiki.musicbrainz.org/Main_Page"
									rel="noopener noreferrer"
									target="_blank"
								>
                  Wiki
								</a>
							</li>
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<a
									href="https://community.metabrainz.org/"
									rel="noopener noreferrer"
									target="_blank"
								>
                  Community
								</a>
							</li>
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<a
									href="https://blog.metabrainz.org/"
									rel="noopener noreferrer"
									target="_blank"
								>
                  Blog
								</a>
							</li>
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<a
									href="https://www.redbubble.com/people/metabrainz/shop"
									rel="noopener noreferrer"
									target="_blank"
								>
                  Shop
								</a>
							</li>
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<a
									href="/privacy"
									rel="noopener noreferrer"
									target="_blank"
								>
                  Privacy & Terms
								</a>
							</li>
							<li className="visible-xs">
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<a
									href="https://github.com/metabrainz/bookbrainz-site"
									rel="noopener noreferrer"
									target="_blank"
								>
                  Contribute Here
								</a>
							</li>
							<li className="visible-xs">
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<a
									href="https://tickets.metabrainz.org/"
									rel="noopener noreferrer"
									target="_blank"
								>
                  Bug Tracker
								</a>
							</li>
						</ul>
					</Col>
					<Col md={3} sm={6} xs={12}>
						<h3 className="w-title-a text-brand">Fellow Projects</h3>
						<ul className="list-unstyled">
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<img
									alt="MusicBrainz"
									height="18"
									src="/images/meb-icons/MusicBrainz.svg"
									width="18"
								/>{' '}
								<a
									href="https://musicbrainz.org/"
									rel="noopener noreferrer"
									target="_blank"
								>
                  MusicBrainz
								</a>
							</li>
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<img
									alt="CritiqueBrainz"
									height="18"
									src="/images/meb-icons/CritiqueBrainz.svg"
									width="18"
								/>{' '}
								<a
									href="https://critiquebrainz.org/"
									rel="noopener noreferrer"
									target="_blank"
								>
                  CritiqueBrainz
								</a>
							</li>
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<img
									alt="Picard"
									height="18"
									src="/images/meb-icons/Picard.svg"
									width="18"
								/>{' '}
								<a
									href="https://picard.musicbrainz.org/"
									rel="noopener noreferrer"
									target="_blank"
								>
                  Picard
								</a>
							</li>
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<img
									alt="ListenBrainz"
									height="18"
									src="/images/meb-icons/ListenBrainz.svg"
									width="18"
								/>{' '}
								<a
									href="https://listenbrainz.org/"
									rel="noopener noreferrer"
									target="_blank"
								>
                  ListenBrainz
								</a>
							</li>
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<img
									alt="AcousticBrainz"
									height="18"
									src="/images/meb-icons/AcousticBrainz.svg"
									width="18"
								/>{' '}
								<a
									href="https://acousticbrainz.org/"
									rel="noopener noreferrer"
									target="_blank"
								>
                  AcousticBrainz
								</a>
							</li>
							<li>
								<FontAwesomeIcon icon={faAnglesRight} size="sm"/>{' '}
								<img
									alt="CoverArtArchive"
									height="18"
									src="/images/meb-icons/CoverArtArchive.svg"
									width="18"
								/>{' '}
								<a
									href="https://coverartarchive.org"
									rel="noopener noreferrer"
									target="_blank"
								>
                  Cover Art Archive
								</a>
							</li>
						</ul>
					</Col>
				</Row>
				<Row className="center-p">
					<Col className="d-none d-sm-block" md={3} sm={12}>
						<p className="color-gray section-line">
              OSS Geek?{' '}
							<a
								href="https://github.com/metabrainz/bookbrainz-site"
								rel="noopener noreferrer"
								target="_blank"
							>
								{' '}
								<span className="color-a"> Contribute Here </span>{' '}
							</a>
						</p>
					</Col>
					<Col md={5} sm={12}>
						<p className="section-line">
              Brought to you by{' '}
							<img
								alt="MetaBrainz"
								height="30"
								src="/images/meb-icons/MetaBrainz.svg"
								width="30"
							/>{' '}
							<span className="color-a"> MetaBrainz Foundation </span>
						</p>
					</Col>
					<Col className="d-none d-sm-block" md={4} sm={12}>
						<p className="color-gray section-line">
              Alpha Software —{' '}
							<a className="color-a" href={`${repositoryUrl}tree/${siteRevision || 'master'}`}>
								{siteRevision || 'unknown revision'}
							</a> —&nbsp;
							<a className="color-a" href="https://tickets.metabrainz.org/projects/BB/issues/">
								Report a Bug
							</a>
						</p>
					</Col>
				</Row>
			</Container>
		</footer>
	);
}

Footer.displayName = 'Footer';
Footer.propTypes = {
	repositoryUrl: PropTypes.string.isRequired,
	siteRevision: PropTypes.string.isRequired
};

export default Footer;
