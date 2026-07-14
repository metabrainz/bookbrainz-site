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
/* eslint-disable max-len */
import {Col, ListGroup, Row} from 'react-bootstrap';
import React from 'react';
import {genEntityIconHTMLElement} from '../../helpers/entity';
import {useTranslation} from 'react-i18next';


/**
 * Renders the document and displays the 'Help' page.
 * @returns {JSX.Element} a React JSX Element
 */
function HelpPage(): JSX.Element {
	const {t: translate} = useTranslation(['staticPages', 'common', 'pages']);
	const IRCLink = 'https://kiwiirc.com/nextclient/irc.libera.chat/?#bookbrainz';
	const userGuideLink =
		'https://bookbrainz-user-guide.readthedocs.io/';

	return (
		<div>

			<div className="page-header">
				<h1>{translate('staticPages:help.title')}</h1>
			</div>
			<p className="lead">
				{translate('staticPages:help.leadIntro')}
				<br/>
				{translate('staticPages:help.leadTrouble')}
				<a href={userGuideLink}>{translate('common:userGuideAndDoc')}</a>
				{translate('staticPages:help.leadOrAsk')}
				<a href={IRCLink}>{translate('common:ircChannel')}</a>
				{translate('staticPages:help.leadPeriod')}
			</p>
			<hr/>

			<h2>{translate('pages:collections.headerEntities')}</h2>
			<p>
				{translate('staticPages:help.entitiesDescription')}
			</p>

			<Row>
				<Col lg={6}>
					<img
						alt="Entity relationships"
						className="img-fluid center-block"
						src="/images/entity_relationships.svg"
					/>
				</Col>
				<Col className="margin-top-2" lg={6}>
					<ListGroup>
						<ListGroup.Item><b>{genEntityIconHTMLElement('Author')}{translate('common:entityType.author')}</b>{translate('staticPages:help.authorDesc')}</ListGroup.Item>
						<ListGroup.Item>
							<b>{genEntityIconHTMLElement('Work')}{translate('common:entityType.work')}</b>{translate('staticPages:help.workDesc')}
							<ul>
								<li>{translate('staticPages:help.workExamples')}</li>
							</ul>
						</ListGroup.Item>
						<ListGroup.Item>
							<b>{genEntityIconHTMLElement('Series')}{translate('common:entityType.series')}</b>{translate('staticPages:help.seriesDesc')}
							<ul>
								<li>{translate('staticPages:help.seriesExamples')}</li>
							</ul>
						</ListGroup.Item>
						<ListGroup.Item>
							<b>{genEntityIconHTMLElement('Edition')}{translate('common:entityType.edition')}</b>{translate('staticPages:help.editionDesc')}
							<ul>
								<li>{translate('staticPages:help.editionExamples')}</li>
								<li>{translate('staticPages:help.editionNote')}</li>
							</ul>
						</ListGroup.Item>
						<ListGroup.Item>
							<b>{genEntityIconHTMLElement('EditionGroup')}{translate('common:entityType.editionGroup')}</b>{translate('staticPages:help.editionGroupDesc')}
							<ul><li>{translate('staticPages:help.editionGroupExamples')}</li></ul>
						</ListGroup.Item>
						<ListGroup.Item><b>{genEntityIconHTMLElement('Publisher')}{translate('common:entityType.publisher')}</b>{translate('staticPages:help.publisherDesc')}</ListGroup.Item>
					</ListGroup>
				</Col>

				<Col lg={12}>
					<h4>{translate('staticPages:help.examplesTitle')}</h4>
					<p>
						{translate('staticPages:help.examplesIntro')}
						<br/>
						{translate('staticPages:help.exampleLeGuinPre')}
						<a href="/author/e66704df-2386-4af9-9b02-a3440a1bc828">Ursula K. Le Guin</a>
						{translate('staticPages:help.exampleLeGuinMid')}
						<a href="/work/11f0af2a-7034-4e7d-baa2-7cf0cb7bcbea">A Wizard of Earthsea</a>
						{translate('staticPages:help.exampleLeGuinPost')}
						<a href="/edition/731ccc5f-35c3-4056-a6e3-00996bb79380">Earthsea: The First Four Books</a>
						{translate('staticPages:help.exampleLeGuinEnd')}
						<br/>
						<a href="/edition/54331325-d11b-47f4-bb74-0485e582c52e">{translate('staticPages:help.exampleAncillaryLink1')}</a>
						{translate('staticPages:help.exampleAncillaryAnd')}
						<a href="/edition/3fa9fdcd-098d-4ec1-82e4-f5fdfb92c41f">{translate('staticPages:help.exampleAncillaryLink2')}</a>
						{translate('staticPages:help.exampleAncillaryText1')}
						<a href="publisher/b065b24d-136f-45e3-badc-48aea4728c73">{translate('staticPages:help.exampleAncillaryLink3')}</a>
						{translate('staticPages:help.exampleAncillaryText2')}
						<a href="/edition-group/540e9c4a-f9fa-427b-a41f-bb12c48f902b">{translate('staticPages:help.exampleAncillaryLink4')}</a>
					</p>
					<hr/>
				</Col>
			</Row>
			<Row>
				<Col lg={12}>
					<hr className="d-lg-none"/>
					<h2>{translate('staticPages:help.glossaryTitle')}</h2>
					<p>
						{translate('staticPages:help.glossaryIntro')}
					</p>
					<br/>
					<ListGroup>
						<ListGroup.Item><b><a href="https://musicbrainz.org/doc/Aliases">{translate('staticPages:help.glossaryAliases')}</a></b>{translate('staticPages:help.glossaryAliasesDesc')}
							<br/>
							{translate('staticPages:help.glossaryExample')}:
							<ul>
								<li>{translate('staticPages:help.glossaryAliasesExampleName1')}</li>
								<li>{translate('staticPages:help.glossaryAliasesExampleName2')}</li>
							</ul>
						</ListGroup.Item>

						<ListGroup.Item><b><a href="https://musicbrainz.org/doc/Style/Artist_Credits">{translate('common:authorCredits')}</a></b>{translate('staticPages:help.glossaryAuthorCreditsDesc')}</ListGroup.Item>

						<ListGroup.Item><b><a href="https://musicbrainz.org/doc/Disambiguation_Comment">{translate('staticPages:help.glossaryDisambiguation')}</a></b>{translate('staticPages:help.glossaryDisambiguationDesc')}
							<br/>
							{translate('staticPages:help.glossaryExample')}:
							<ul>
								<li>{translate('staticPages:help.glossaryDisambiguationExample1')}</li>
								<li>{translate('staticPages:help.glossaryDisambiguationExample2')}</li>
							</ul>
						</ListGroup.Item>

						<ListGroup.Item><b>{translate('pages:collections.headerEntities')}</b>{translate('staticPages:help.glossaryEntitiesDesc')}</ListGroup.Item>

						<ListGroup.Item><b><a href="https://en.wikipedia.org/wiki/Category:Book_formats">{translate('common:format')}</a></b>{translate('staticPages:help.glossaryFormatDesc')}</ListGroup.Item>

						<ListGroup.Item><b>{translate('staticPages:help.glossaryIdentifiers')}</b>{translate('staticPages:help.glossaryIdentifiersDescPre')}
							<br/>{translate('staticPages:help.glossaryIdentifiersDescPost')}
						</ListGroup.Item>

						<ListGroup.Item><b><a href="https://en.wikipedia.org/wiki/Edition_(book)#Printing,_print_run,_impression,_et_cetera">{translate('staticPages:help.glossaryPrinting')}</a></b>{translate('staticPages:help.glossaryPrintingDescPre')}
							<br/>{translate('staticPages:help.glossaryPrintingDescPost')}
						</ListGroup.Item>

						<ListGroup.Item><b><a href="https://musicbrainz.org/doc/Style/Artist/Sort_Name">{translate('staticPages:help.glossarySortName')}</a></b>{translate('staticPages:help.glossarySortNameDesc')}
							<br/>
							{translate('staticPages:help.glossaryExample')}:
							<ul>
								<li>{translate('staticPages:help.glossarySortNameExample1')}</li>
								<li>{translate('staticPages:help.glossarySortNameExample2')}</li>
								<li>{translate('staticPages:help.glossarySortNameExample3')}</li>
							</ul>
						</ListGroup.Item>
					</ListGroup>
				</Col>
			</Row>
		</div>
	);
}

HelpPage.displayName = 'HelpPage';

export default HelpPage;
