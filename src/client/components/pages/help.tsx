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


/**
 * Renders the document and displays the 'Help' page.
 * @returns {JSX.Element} a React JSX Element
 */
function HelpPage(): JSX.Element {
	const IRCLink = 'https://kiwiirc.com/nextclient/irc.libera.chat/?#bookbrainz';
	const userGuideLink =
		'https://bookbrainz-user-guide.readthedocs.io/';

	return (
		<div>

			<div className="page-header">
				<h1>Help page</h1>
			</div>
			<p className="lead">
				Feeling lost? On this page you will find explanations of the basic concepts
				used across BookBrainz, as well as an F.A.Q and a glossary.
				<br/>
				Still having some trouble with something?
				You can refer to the <a href={userGuideLink}>user guide and documentation</a>,
				or come ask us directly on our <a href={IRCLink}>IRC channel</a>.
			</p>
			<hr/>

			<h2>Entities</h2>
			<p>
				Entities are the main concepts used to describe a bibliographic record through their relationships
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
						<ListGroup.Item><b>{genEntityIconHTMLElement('Author')}Author</b> – an individual, group or collective that participates in the creative process of an artistic work. It also includes translators, illustrators, editors, etc.</ListGroup.Item>
						<ListGroup.Item>
							<b>{genEntityIconHTMLElement('Work')}Work</b> – a distinct intellectual or artistic creation expressed in words and/or images.
							Here we are not talking, for example, about a physical book, but the introduction, story, illustrations, etc. it contains.
							<ul>
								<li>Examples: novel, poem, translation, introduction & foreword, article, research paper, etc.</li>
							</ul>
						</ListGroup.Item>
						<ListGroup.Item>
							<b>{genEntityIconHTMLElement('Series')}Series</b> – a set or sequence of related works, editions, authors, publishers or edition-groups.
							<ul>
								<li>Examples: a series of novels, a series of comics, etc.</li>
							</ul>
						</ListGroup.Item>
						<ListGroup.Item>
							<b>{genEntityIconHTMLElement('Edition')}Edition</b> –  a published physical or digital version of one or more Works.
							<ul>
								<li>Examples: book, anthology, comic book, magazine, leaflet</li>
								<li>Note: An Author can self-publish an Edition</li>
							</ul>
						</ListGroup.Item>
						<ListGroup.Item>
							<b>{genEntityIconHTMLElement('EditionGroup')}Edition Group</b> – a logical grouping of different Editions of the same book.
							<ul><li>Example: paperback, hardcover and e-book editions of a novel</li></ul>
						</ListGroup.Item>
						<ListGroup.Item><b>{genEntityIconHTMLElement('Publisher')}Publisher</b> – publishing company or imprint</ListGroup.Item>
					</ListGroup>
				</Col>

				<Col lg={12}>
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
				<Col lg={12}>
					<hr className="d-lg-none"/>
					<h2>Glossary</h2>
					<p>
					Here is a short description of some of the main terms you will encounter.
					Some terms are borrowed from MusicBrainz; click on the term to be redirected to the MusicBrainz guidelines or a definition.
					</p>
					<br/>
					<ListGroup>
						<ListGroup.Item><b><a href="https://musicbrainz.org/doc/Aliases">Aliases</a></b> – Variant names for an entity such as alternate spelling, different script, stylistic representation, acronyms, etc.
							<br/>
							Example:
							<ul>
								<li>Name: 村上 春樹 – Alias (english): Haruki Murakami</li>
								<li>Name: J.K. Rowling – Alias (full name): Joanne Kathleen Rowling – Alias (pseudonym): Robert Galbraith</li>
							</ul>
						</ListGroup.Item>

						<ListGroup.Item><b><a href="https://musicbrainz.org/doc/Style/Artist_Credits">Author Credits</a></b> – As appearing on the publication cover. For example, if the author is using a pseudonym, the credits should reflect that.</ListGroup.Item>

						<ListGroup.Item><b><a href="https://musicbrainz.org/doc/Disambiguation_Comment">Disambiguation</a></b> – Short comment added to differentiate between similarly-named entities.
							<br/>
							Example:
							<ul>
								<li>The Alchemist (philosophical novel) by Paulo Coelho</li>
								<li>The Alchemyst (YA novel featuring Nicolas Flamel) by Michael Scott</li>
							</ul>
						</ListGroup.Item>

						<ListGroup.Item><b>Entities</b> – Conceptual items representing the various authors and parts of a publication. See the previous Entities section for details.</ListGroup.Item>

						<ListGroup.Item><b><a href="https://en.wikipedia.org/wiki/Category:Book_formats">Format</a></b> – Refers to different printing and/or binding methods, or digital distribution.
							<br/>For example: paperback, mass-market, hardcover and e-book are all book formats
						</ListGroup.Item>

						<ListGroup.Item><b>Identifiers</b> – identity of an entity in other databases and services, such as ISBN, barcode, MusicBrainz ID, WikiData ID, etc.
							<br/>When adding identifiers to an entity, you can enter either the identifier only (Q2517049) or a full link (https://www.wikidata.org/wiki/Q2517049).
						</ListGroup.Item>

						<ListGroup.Item><b><a href="https://en.wikipedia.org/wiki/Edition_(book)#Printing,_print_run,_impression,_et_cetera">Printing, print run, impression</a></b> – A batch of identical copies of an edition of a work that is printed in a same, single production set-up.
							<br/>One edition of a work may have any number of printings, e. g. a same Edition can have a first impression and a second impression.
						</ListGroup.Item>

						<ListGroup.Item><b><a href="https://musicbrainz.org/doc/Style/Artist/Sort_Name">Sort name</a></b> – Modified name to help sorting alphabetically
							<br/>
							Example:
							<ul>
								<li>Charles Dickens -&gt; Dickens, Charles</li>
								<li>A Tale of Two Cities -&gt; Tale of Two Cities, A</li>
								<li>Benito Pérez Galdós -&gt; Pérez Galdós, Benito</li>
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
