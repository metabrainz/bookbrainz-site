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


const {PageHeader, ListGroup, ListGroupItem} = bootstrap;

/**
 * Renders the document and displays the 'Help' page.
 * @returns {ReactElement} a HTML document to display the Develop page
 */
function HelpPage() {
	const IRCLink = 'https://webchat.freenode.net/?channels=#metabrainz';
	const styleLink =
		'https://bb-user-guide.readthedocs.org/en/latest/' +
		'style/introduction/';

	return (
		<div>
			<PageHeader>Help page</PageHeader>
			<p className="lead">
				Feeling lost? On this page you will find explanations of the basic concepts
				used across BookBrainz, as well as an F.A.Q and a glossary.
				<br/>
				Still having some trouble with something?
				You can refer to the <a href={styleLink}>style documentation</a>,
				or come ask us directly on our <a href={IRCLink}>IRC channel</a>.
			</p>

			<h2>Entities</h2>

			<p>
				Entities are the main concepts used to describe a bibliographic record through their relationships
				<br/>
			</p>
			<ListGroup>
				<ListGroupItem><b>{genEntityIconHTMLElement('Creator')}Author</b> – an individual, group or collective that participates in the creative process of an artistic work. It also includes translators, illustrators, etc.</ListGroupItem>
				<ListGroupItem><b>{genEntityIconHTMLElement('Publisher')}Publisher</b> – publishing company or imprint</ListGroupItem>
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
					<b>{genEntityIconHTMLElement('Publication')}Edition Group</b> – a logical grouping of similar Editions of the same Work(s).
					<ul><li>Example: paperback, hardcover and e-book editions of single Work</li></ul>
				</ListGroupItem>
			</ListGroup>

			<h4>Examples</h4>
			<p>
				The following examples should help you understand the different entities and how they relate to each other:
				<br/>
				The relationship between an <a href="/creator/ac59097e-7f86-436d-9308-f6e63871ceff">Author</a> , their <a href="/work/97eafaf5-377a-4703-a12e-d66a30fcfda1">Work (short story)</a> and an <a href="/edition/b3ed75ea-9f74-44fa-833e-fa2c895c6b12"> Edition (anthology)</a> of one or more works
				<br/>
				<a href="/edition/54331325-d11b-47f4-bb74-0485e582c52e">Paperback</a> and <a href="/edition/3fa9fdcd-098d-4ec1-82e4-f5fdfb92c41f">E-book</a> editions of the same novel by the same publisher making them part of the same <a href="/publication/540e9c4a-f9fa-427b-a41f-bb12c48f902b">Edition Group</a>
			</p>

			<hr/>
			<h2>Frequently Asked Questions</h2>
			<br/>
			<h4>When should I create a new Edition of a Work?</h4>
			<ul>
				<li>When it is published in a different format (e.g. paperback and e-book)</li>
				<li>When there are substantial content (textual or editorial) changes</li>
				<li>Translations will both be a new Work and a new Edition for it.</li>
				<li>Add a relationship between the original and the translated Works</li>
				<li>New cover or changed credits/attribution on the cover</li>
			</ul>
			<br/>
			<h4>When should I not create a new Edition of a Work?</h4>
			<ul>
				<li>Minimal changes as in proofreading errors</li>
				<li>Minimal changes on the cover</li>
				<li>Reprints of the same Edition. You can mention “Reprint – [date]” in the annotations.</li>
			</ul>
			<br/>
			<h4>When should two Editions be part of the same Edition Group?</h4>
			Generally, when a publisher releases multiple different formats of the same content, meaning:
			<ul>
				<li>No substantial textual changes to the Work (corrections aside)</li>
				<li>Same editorial content (intro, foreword, etc.)</li>
				<li>Same publisher</li>
				<li>Same title and cover</li>
			</ul>

			<hr/>
			<h2>Glossary</h2>
			<p>
			Here is a short description of some of the main terms you will encounter.
			Some terms are borrowed from MusicBrainz; click on the term to be redirected to the MusicBrainz guidelines.
				<br/>
				<br/>
				<ListGroup>
					<ListGroupItem><b>Aliases</b> – Variant names for an entity such as alternate spelling, different script (example: Official name: 村上 春樹 / Alias: Haruki Murakami), stylistic representation, acronyms, etc.</ListGroupItem>

					<ListGroupItem><b>Author Credits</b> – As appearing on the publication cover. For example, if the author is using a pseudonym, the credits should reflect that.</ListGroupItem>

					<ListGroupItem><b>Disambiguation</b> – Short comment added to differentiate between similarly-named entities.
						<br/>
						Example:
						<ul>
							<li>The Alchemist (philosophical novel) by Paulo Coelho</li>
							<li>The Alchemyst (Nicolas Flamel biography) by Michael Scott</li>
						</ul>
					</ListGroupItem>

					<ListGroupItem><b>Entities</b> – Conceptual items representing the various actors and parts of a publication. See definitions of the entities at the top of this page.</ListGroupItem>

					<ListGroupItem><b>Format</b> – Physical or digital aspect of the edition. These usually refer to different printing and binding methods.
						<br/>For example: paperback, mass-market, hardcover, e-book are all book formats.
					</ListGroupItem>

					<ListGroupItem><b>Identifiers</b> – identity of an entity in other databases and services, such as ISBN, barcode, MusicBrainz ID, WikiData ID, etc.
						<br/>You can enter either the identifier only (Q2517049) or a full link (https://www.wikidata.org/wiki/Q2517049).
					</ListGroupItem>

					<ListGroupItem><b>Printing</b>, print run, impression – A batch of identical copies of an edition of a work that is printed in a same, single production set-up.
						<br/>One edition of a work may have any number of printings, e. g. first edition, first impression; first edition, second impression; and second edition, first impression.
					</ListGroupItem>

					<ListGroupItem><b>Sort name</b> – Modified name to help sorting alphabetically
						<br/>
						Example:
						<ul>
							<li>Charles Dickens -&gt; Dickens, Charles</li>
							<li>A Tale of Two Cities -&gt; Tale of Two Cities, A</li>
						</ul>
					</ListGroupItem>
				</ListGroup>
			</p>
		</div>
	);
}

HelpPage.displayName = 'HelpPage';

export default HelpPage;
