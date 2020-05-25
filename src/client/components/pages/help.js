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

import * as bootstrap from 'react-bootstrap';

import React from 'react';
import {genEntityIconHTMLElement} from '../../helpers/entity';


const {PageHeader, ListGroup, ListGroupItem, Grid, Col, Row} = bootstrap;

/* eslint max-len: 0 */
/**
 * Renders the document and displays the 'Help' page.
 * @returns {ReactElement} a HTML document to display the Develop page
 */
function HelpPage() {
	const IRCLink = 'https://webchat.freenode.net/?channels=#metabrainz';
	const styleLink =
		'https://bookbrainz-user-guide.readthedocs.io/' +
		'style/introduction/';

	return (
		<Grid>

			<PageHeader>Help page</PageHeader>
			<p className="lead">
				Feeling lost? On this page you will find explanations of the basic concepts
				used across BookBrainz, as well as an F.A.Q and a glossary.
				<br/>
				Still having some trouble with something?
				You can refer to the <a href={styleLink}>style documentation</a>,
				or come ask us directly on our <a href={IRCLink}>IRC channel</a>.
			</p>
			<hr/>

			<Row>
				<h2>Entities</h2>
				<p>
					Entities are the main concepts used to describe a bibliographic record through their relationships
				</p>

				<Col md={4}>
					<img
						alt="Entity relationships"
						className="img-responsive center-block"
						src="/images/entity_relationships.svg"
					/>
				</Col>
				<Col className="margin-top-2" md={8}>
					<ListGroup>
						<ListGroupItem><b>{genEntityIconHTMLElement('Author')}Author</b> – an individual, group or collective that participates in the creative process of an artistic work. It also includes translators, illustrators, editors, etc.</ListGroupItem>
						<ListGroupItem>
							<b>{genEntityIconHTMLElement('Work')}Work</b> – a distinct intellectual or artistic creation expressed in words and/or images.
							Here we are not talking, for example, about a physical book, but the introduction, story, illustrations, etc. it contains.
							<ul>
								<li>Examples: novel, poem, translation, introduction & foreword, article, research paper, etc.</li>
							</ul>
						</ListGroupItem>
						<ListGroupItem>
							<b>{genEntityIconHTMLElement('Edition')}Edition</b> –  a published physical or digital version of one or more Works.
							<ul>
								<li>Examples: book, anthology, comic book, magazine, leaflet</li>
								<li>Note: An Author can self-publish an Edition</li>
							</ul>
						</ListGroupItem>
						<ListGroupItem>
							<b>{genEntityIconHTMLElement('EditionGroup')}Edition Group</b> – a logical grouping of different Editions of the same book.
							<ul><li>Example: paperback, hardcover and e-book editions of a novel</li></ul>
						</ListGroupItem>
						<ListGroupItem><b>{genEntityIconHTMLElement('Publisher')}Publisher</b> – publishing company or imprint</ListGroupItem>
					</ListGroup>
				</Col>

				<Col md={12}>
					<h4>Examples</h4>
					<p>
						The following examples should help you understand the different entities and how they relate to each other:
						<br/>
						The relationship between <a href="/author/ac59097e-7f86-436d-9308-f6e63871ceff">H.P Lovecraft</a> , his short story <a href="/work/97eafaf5-377a-4703-a12e-d66a30fcfda1">At the Mountains of Madness</a> and an Edition <a href="/edition/b3ed75ea-9f74-44fa-833e-fa2c895c6b12">The Classic Horror Stories</a> which contain it and several more works.
						<br/>
						<a href="/edition/54331325-d11b-47f4-bb74-0485e582c52e">Paperback</a> and <a href="/edition/3fa9fdcd-098d-4ec1-82e4-f5fdfb92c41f">E-book</a> editions of the novel Ancillary Mercy by the publisher <a href="publisher/b065b24d-136f-45e3-badc-48aea4728c73">Orbit Books</a>  making them part of the same <a href="/edition-group/540e9c4a-f9fa-427b-a41f-bb12c48f902b">Edition Group</a>
					</p>
					<hr/>
				</Col>
			</Row>

			<Row>
				<Col md={6}>
					<h2>Frequently Asked Questions</h2>
					<br/>
					<h4>How do I add a book?</h4>
					First and foremost, search for both the author and the title of the book to avoid creating duplicates.
					<br/>If a Work and an Edition containing it exist, the questions below will help you decide whether to create a new Edition.
					<br/>Otherwise, here is a step-by-step procedure:
					<br/>
					<br/>
					<ol>
						<li>Find or add a new {genEntityIconHTMLElement('Author')}Author</li>
						<li>On the Author page, click on &#39;Add Work&#39; to create a {genEntityIconHTMLElement('Work')}Work with a relationship to the Author</li>
						<li>On the Work page, click &#39;Add Edition&#39; to create an {genEntityIconHTMLElement('Edition')}Edition with a relationship to the Work.
							<ul>
								<li>A new {genEntityIconHTMLElement('EditionGroup')}Edition Group will be created automatically, but you can select an existing one</li>
								<li>Create a new {genEntityIconHTMLElement('Publisher')}Publisher if you cannot find an existing one</li>
							</ul>
						</li>
						<li>To enter another format of the same book (see explanations below), go to the Edition Group and click the &#x27;Add Edition&#x27; button. Repeat step 4.</li>
					</ol>
					<br/>
					<h4>When should I create a new Edition of a Work?</h4>
					<ul>
						<li>When it is published in a different format (e.g. paperback and e-book)</li>
						<li>When there are substantial content (textual or editorial) changes</li>
						<li>Translations will both be a new Work and a new Edition for it.</li>
						<li>Add a relationship between the original and the translated Works</li>
						<li>New cover or changed credits/attribution on the cover</li>
						<li>When there&#x27;s a new ISBN</li>
					</ul>
					<br/>
					<h4>When should I <i>not</i> create a new Edition of a Work?</h4>
					<ul>
						<li>Minimal changes as in proofreading errors</li>
						<li>Minimal changes on the cover</li>
						<li>Reprints of the same Edition. You can mention “Reprint – [date]” in the annotations.</li>
						<li>When the edition uses the same ISBN (with rare exceptions)</li>
					</ul>
					<br/>
					<h4>When should two Editions be part of the same Edition Group?</h4>
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
				</Col>

				<Col md={6}>
					<hr className="visible-sm"/>
					<h2>Glossary</h2>
					<p>
					Here is a short description of some of the main terms you will encounter.
					Some terms are borrowed from MusicBrainz; click on the term to be redirected to the MusicBrainz guidelines or a definition.
					</p>
					<br/>
					<ListGroup>
						<ListGroupItem><b><a href="https://musicbrainz.org/doc/Aliases">Aliases</a></b> – Variant names for an entity such as alternate spelling, different script, stylistic representation, acronyms, etc.
							<br/>
							Example:
							<ul>
								<li>Name: 村上 春樹 – Alias (english): Haruki Murakami</li>
								<li>Name: J.K. Rowling – Alias (full name): Joanne Kathleen Rowling – Alias (pseudonym): Robert Galbraith</li>
							</ul>
						</ListGroupItem>

						<ListGroupItem><b><a href="https://musicbrainz.org/doc/Style/Artist_Credits">Author Credits</a></b> – As appearing on the publication cover. For example, if the author is using a pseudonym, the credits should reflect that.</ListGroupItem>

						<ListGroupItem><b><a href="https://musicbrainz.org/doc/Disambiguation_Comment">Disambiguation</a></b> – Short comment added to differentiate between similarly-named entities.
							<br/>
							Example:
							<ul>
								<li>The Alchemist (philosophical novel) by Paulo Coelho</li>
								<li>The Alchemyst (Nicolas Flamel biography) by Michael Scott</li>
							</ul>
						</ListGroupItem>

						<ListGroupItem><b>Entities</b> – Conceptual items representing the various authors and parts of a publication. See the previous Entities section for details.</ListGroupItem>

						<ListGroupItem><b><a href="https://en.wikipedia.org/wiki/Category:Book_formats">Format</a></b> – Refers to different printing and/or binding methods, or digital distribution.
							<br/>For example: paperback, mass-market, hardcover and e-book are all book formats
						</ListGroupItem>

						<ListGroupItem><b>Identifiers</b> – identity of an entity in other databases and services, such as ISBN, barcode, MusicBrainz ID, WikiData ID, etc.
							<br/>When adding identifiers to an entity, you can enter either the identifier only (Q2517049) or a full link (https://www.wikidata.org/wiki/Q2517049).
						</ListGroupItem>

						<ListGroupItem><b><a href="https://en.wikipedia.org/wiki/Edition_(book)#Printing,_print_run,_impression,_et_cetera">Printing, print run, impression</a></b> – A batch of identical copies of an edition of a work that is printed in a same, single production set-up.
							<br/>One edition of a work may have any number of printings, e. g. a same Edition can have a first impression and a second impression.
						</ListGroupItem>

						<ListGroupItem><b><a href="https://musicbrainz.org/doc/Style/Artist/Sort_Name">Sort name</a></b> – Modified name to help sorting alphabetically
							<br/>
							Example:
							<ul>
								<li>Charles Dickens -&gt; Dickens, Charles</li>
								<li>A Tale of Two Cities -&gt; Tale of Two Cities, A</li>
								<li>Benito Pérez Galdós -&gt; Pérez Galdós, Benito</li>
							</ul>
						</ListGroupItem>
					</ListGroup>

				</Col>
			</Row>


		</Grid>
	);
}

HelpPage.displayName = 'HelpPage';

export default HelpPage;
