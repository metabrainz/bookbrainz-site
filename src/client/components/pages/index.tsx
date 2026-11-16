/*
 * Copyright (C) 2016  Daniel Hsing
 *               2016  Ben Ockmore
 *               2015  Sean Burke
 *               2015  Leo Verto
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

import {Trans, useTranslation} from 'react-i18next';
import {faBluesky, faMastodon} from '@fortawesome/free-brands-svg-icons';
import {faCircle, faCommentDots, faComments, faEnvelope, faListUl, faSearch, faUser} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Link} from 'react-router';
import React from 'react';
import RevisionsTable from './parts/revisions-table';


const {Alert, Button, Col, Container, Row} = bootstrap;

type Props = {
	disableSignUp?: boolean,
	isLoggedIn: boolean,
	recent: unknown[],
	showEntities?: boolean,
	showRevisionEditor?: boolean
};

export default function IndexPage({disableSignUp = false, isLoggedIn, recent, showEntities = true, showRevisionEditor = true}: Props) {
	const {t: translate} = useTranslation();

	function renderHeader() {
		return (
			<div>
				<Alert className="text-center" variant="warning">
					<Trans
						components={{
							jiraLink: <a href="//tickets.metabrainz.org/projects/BB"/>
						}}
						i18nKey="pages.index.underDevelopment"
					/>
				</Alert>
				<div id="background-image">
					<div className="text-center" id="background-overlay">
						<Container>
							<img
								alt={translate('pages.index.logoAlt')}
								className="img-fluid center-block"
								src="/images/BookBrainz_text.svg"
								title={translate('common.Bookbrainz')}
								width="500"
							/>
							<Row>
								<Col lg={{offset: 2, span: 8}}>
									<form action="/search" className="input-group input-group-lg margin-top-5" role="search">
										<input
											autoFocus
											required
											className="form-control"
											name="q"
											placeholder={translate('common.nav.searchPlaceholder')}
											type="text"
										/>
										<span className="input-group-append">
											<Button
												type="submit"
												variant="success"
											>
												<FontAwesomeIcon icon={faSearch}/>
											</Button>
										</span>
									</form>
									<Row className="margin-top-4">
										<Col md={4}>
											<Button
												block
												as={Link}
												size="lg"
												to="/about"
												variant="secondary"
											>
												{translate('pages.index.aboutButton')}
											</Button>
										</Col>
										<Col md={4}>
											<Button
												block
												as={Link}
												size="lg"
												to="/contribute"
												variant="secondary"
											>
												{translate('pages.index.contributeButton')}
											</Button>
										</Col>
										<Col md={4}>
											<Button
												block
												as={Link}
												size="lg"
												to="/develop"
												variant="secondary"
											>
												{translate('pages.index.developButton')}
											</Button>
										</Col>
									</Row>
									<div className="margin-top-3">
										<h4 className="contact-text">
											{translate('common.about.contactUs')}
										</h4>
										<div style={{
											alignItems: 'center',
											display: 'flex',
											justifyContent: 'center'
										}}
										>
											<FontAwesomeIcon
												className="margin-sides-1 contact-text"
												icon={faCircle}
											/>
											<a className="contact-text" href="https://musicbrainz.org/doc/Communication/ChatBrainz">
												<FontAwesomeIcon
													className="contact-text"
													icon={faCommentDots}
													size="2x"
												/>
												{translate('pages.index.chatWithUs')}<br/>
												<small>{translate('pages.index.matrixIrcDiscord')}</small>
											</a>
											<FontAwesomeIcon
												className="margin-sides-1 contact-text"
												icon={faCircle}
											/>
											<a className="contact-text" href="//community.metabrainz.org/c/bookbrainz">
												<FontAwesomeIcon
													className="contact-text"
													icon={faComments}
													size="2x"
												/>
												{translate('common.forums')}
											</a>
											<FontAwesomeIcon
												className="margin-sides-1 contact-text"
												icon={faCircle}
											/>
											<a className="contact-text" href="https://mastodon.social/@BookBrainz">
												<FontAwesomeIcon
													className="contact-text"
													icon={faMastodon}
													size="2x"
												/>
												{translate('pages.index.mastodon')}
											</a>
											<FontAwesomeIcon
												className="margin-sides-1 contact-text"
												icon={faCircle}
											/>
											<a className="contact-text" href="https://bsky.app/profile/bookbrainz.org">
												<FontAwesomeIcon
													className="contact-text"
													icon={faBluesky}
													size="2x"
												/>
												{translate('pages.index.bluesky')}
											</a>
											<FontAwesomeIcon
												className="margin-sides-1 contact-text"
												icon={faCircle}
											/>
											<a className="contact-text" href="mailto:bookbrainz@metabrainz.org">
												<FontAwesomeIcon
													className="contact-text"
													icon={faEnvelope}
													size="2x"
												/>
												{translate('common.email')}
											</a>
											<FontAwesomeIcon
												className="margin-sides-1 contact-text"
												icon={faCircle}
											/>
										</div>
									</div>
								</Col>
							</Row>
						</Container>
					</div>
				</div>
			</div>
		);
	}

	function renderAboutUs() {
		const signUpProps = disableSignUp ? {disabled: true} : {};
		return (
			<React.Fragment>
				<Row>
					<Col className="text-center margin-top-4" lg={2}>
						<FontAwesomeIcon icon={faUser} size="5x"/>
					</Col>
					<Col lg={10}>
						<h2>{translate('pages.index.joinUs')}</h2>
						<p className="lead">
							<Trans
								components={{
									aboutLink: <a href="/about" target="blank"/>,
									contributeLink: <a href="/contribute" target="blank"/>
								}}
								i18nKey="pages.index.joinUsDescription"
							/>
						</p>
					</Col>
				</Row>
				<div className="text-center margin-top-1 margin-bottom-3">
					<Button
						{...signUpProps}
						href="/register"
						size="lg"
						variant="success"
					>
						{translate('pages.index.registerButton')}
					</Button>
				</div>
			</React.Fragment>
		);
	}

	function renderContent() {
		return (
			<Container>
				<Row>
					<Col lg={{offset: 2, span: 8}}>
						<h1 className="text-center">{translate('pages.index.openBookDatabase')}</h1>
						<p className="lead text-justify">
							{translate('pages.index.openBookDatabaseDescription')}
						</p>
					</Col>
				</Row>
				<hr/>
				{!isLoggedIn && renderAboutUs()}
				<div>
					<RevisionsTable
						results={recent}
						showEntities={showEntities}
						showRevisionEditor={showRevisionEditor}
						tableHeading={translate('pages.revisions.recentActivity')}
					/>
					<div className="text-center">
						<Button
							as={Link}
							to="/revisions"
							variant="primary"
						>
							<FontAwesomeIcon className="margin-right-0-5" icon={faListUl}/>
							{translate('pages.index.seeAllRevisions')}
						</Button>
					</div>
				</div>
			</Container>
		);
	}

	return (
		<div>
			{renderHeader()}
			{renderContent()}
		</div>
	);
}
