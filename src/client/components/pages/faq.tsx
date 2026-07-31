/*
 * Copyright (C) 2023 Shivam Awasthi
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
import {Card, ListGroup} from 'react-bootstrap';
import React from 'react';
import {genEntityIconHTMLElement} from '../../helpers/entity';
import {useTranslation} from 'react-i18next';

/**
 * Renders the page for the Frequently Asked Questions on Bookbrainz
 * @returns {JSX.Element} a React JSX Element
 */
function FAQPage(): JSX.Element {
	const {t: translate} = useTranslation(['staticPages', 'common']);
	return (
		<Card>
			<Card.Header as="h2">
				{translate('staticPages:faq.title')}
			</Card.Header>
			<Card.Body>
				<ListGroup>
					<ListGroup.Item>
						<h4><b>{translate('staticPages:faq.q1')}</b></h4>
						{translate('staticPages:faq.q1.a1')}
						<br/>{translate('staticPages:faq.q1.a2')}
						<br/>{translate('staticPages:faq.q1.a3')}
						<br/>
						<br/>
						<ol>
							<li>{translate('staticPages:faq.q1.step1Pre')}{genEntityIconHTMLElement('Author')}{translate('common:entityType.author')}</li>
							<li>On the Author page, click on &#39;Add Work&#39; to create a {genEntityIconHTMLElement('Work')}{translate('staticPages:faq.q1.step2Post')}</li>
							<li>
								{translate('staticPages:faq.q1.step3Pre')}{genEntityIconHTMLElement('Edition')}{translate('staticPages:faq.q1.step3Mid')}
								<ul>
									<li>{translate('staticPages:faq.q1.step3Sub1Pre')}{genEntityIconHTMLElement('EditionGroup')}{translate('staticPages:faq.q1.step3Sub1Post')}</li>
									<li>{translate('staticPages:faq.q1.step3Sub2Pre')}{genEntityIconHTMLElement('Publisher')}{translate('staticPages:faq.q1.step3Sub2Post')}</li>
								</ul>
							</li>
							<li>{translate('staticPages:faq.q1.step4')}</li>
						</ol>
					</ListGroup.Item>
					<ListGroup.Item>
						<h4><b>{translate('staticPages:faq.q2')}</b></h4>
						<ul>
							<li>{translate('staticPages:faq.q2.item1')}</li>
							<li>{translate('staticPages:faq.q2.item2')}</li>
							<li>{translate('staticPages:faq.q2.item3')}</li>
							<li>{translate('staticPages:faq.q2.item4')}</li>
							<li>{translate('staticPages:faq.q2.item5')}</li>
							<li>{translate('staticPages:faq.q2.item6')}</li>
						</ul>
					</ListGroup.Item>
					<ListGroup.Item>
						<h4><b>{translate('staticPages:faq.q3')}</b></h4>
						<ul>
							<li>{translate('staticPages:faq.q3.item1')}</li>
							<li>{translate('staticPages:faq.q3.item2')}</li>
							<li>{translate('staticPages:faq.q3.item3')}</li>
							<li>{translate('staticPages:faq.q3.item4')}</li>
						</ul>
					</ListGroup.Item>
					<ListGroup.Item>
						<h4><b>{translate('staticPages:faq.q4')}</b></h4>
						{translate('staticPages:faq.q4.introPre')}
						<br/>
						<ul>
							<li>{translate('staticPages:faq.q4.item1')}</li>
							<li>{translate('staticPages:faq.q4.item2')}</li>
							<li>{translate('staticPages:faq.q4.item3')}</li>
							<li>{translate('staticPages:faq.q4.item4')}</li>
							<li>{translate('staticPages:faq.q4.item5')}</li>
						</ul>
					</ListGroup.Item>
				</ListGroup>
			</Card.Body>
		</Card>
	);
}

FAQPage.displayName = 'FAQPage';

export default FAQPage;
