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

/**
 * Renders the page for the Frequently Asked Questions on Bookbrainz
 * @returns {JSX.Element} a React JSX Element
 */
function FAQPage(): JSX.Element {
	return (
		<Card>
			<Card.Header as="h2">
				Frequently Asked Questions
			</Card.Header>
			<Card.Body>
				<ListGroup>
					<ListGroup.Item>
						<h4><b>How do I add a book?</b></h4>
						First and foremost, search for both the author and the title of the book to avoid creating duplicates.
						<br/>If a Work and an Edition containing it exist, the questions below will help you decide whether to create a new Edition.
						<br/>Otherwise, here is a step-by-step procedure:
						<br/>
						<br/>
						<ol>
						    <li>Find or add a new {genEntityIconHTMLElement('Author')}Author</li>
						    <li>On the Author page, click on &#39;Add Work&#39; to create a {genEntityIconHTMLElement('Work')}Work with a relationship to the Author</li>
							<li>
								On the Work page, click &#39;Add Edition&#39; to create an {genEntityIconHTMLElement('Edition')}Edition with a relationship to the Work.
								<ul>
									<li>A new {genEntityIconHTMLElement('EditionGroup')}Edition Group will be created automatically, but you can select an existing one</li>
									<li>Create a new {genEntityIconHTMLElement('Publisher')}Publisher if you cannot find an existing one</li>
								</ul>
							</li>
							<li>To enter another format of the same book (see explanations below), go to the Edition Group and click the &#x27;Add Edition&#x27; button. Repeat step 4.</li>
						</ol>
					</ListGroup.Item>
					<ListGroup.Item>
						<h4><b>When should I create a new Edition of a Work?</b></h4>
						<ul>
							<li>When it is published in a different format (e.g. paperback and e-book)</li>
							<li>When there are substantial content (textual or editorial) changes</li>
							<li>Translations will both be a new Work and a new Edition for it.</li>
							<li>Add a relationship between the original and the translated Works</li>
							<li>New cover or changed credits/attribution on the cover</li>
							<li>When there&#x27;s a new ISBN</li>
						</ul>
					</ListGroup.Item>
					<ListGroup.Item>
						<h4><b>When should I <i>not</i> create a new Edition of a Work?</b></h4>
						<ul>
							<li>Minimal changes as in proofreading errors</li>
							<li>Minimal changes on the cover</li>
							<li>Reprints of the same Edition. You can mention “Reprint – [date]” in the annotations.</li>
							<li>When the edition uses the same ISBN (with rare exceptions)</li>
						</ul>
					</ListGroup.Item>
					<ListGroup.Item>
						<h4><b>When should two Editions be part of the same Edition Group?</b></h4>
						Edition Groups exist to group together all the variations of an edition (an identifiable set of works) in a given language.
						Here are examples of Editions that should be part of the same Edition Group:
						<br/>
						<ul>
							<li>Different formats of the same edition (paperback, hardcover and e-book by the same publisher)</li>
							<li>Revised and updated editions</li>
							<li>Reprints</li>
							<li>Editions with different forewords/intros</li>
							<li>Co-editions (same book published in different countries by different publishers)</li>
						</ul>
					</ListGroup.Item>
				</ListGroup>
			</Card.Body>
		</Card>
	);
}

FAQPage.displayName = 'FAQPage';

export default FAQPage;
