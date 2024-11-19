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

import {faCircle, faCommentDots, faComments, faEnvelope} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import React from 'react';
import {faXTwitter} from '@fortawesome/free-brands-svg-icons';


/**
 * Renders the document and displays the 'About' page.
 * @returns {JSX.Element} a React JSX Element
 * page
 */
function AboutPage(): JSX.Element {
	const NESLink =
		'https://ocharles.org.uk/blog/posts/' +
			'2012-07-10-nes-does-it-better-1.html';

	return (
		<div>
			<div className="page-header"><h1>About BookBrainz</h1></div>
			<p className="lead">
				BookBrainz is an online encyclopaedia which contains
				information about published literature. Our aim is to
				collect and store data about every book, magazine, journal
				or other publication ever written.
			</p>

			<p>
				We are committed
				to making BookBrainz the definitive source of publication
				metadata. We hope to attract many contributors, who will be
				able to use their knowledge of literature to expand the
				database through our website. If you think you can
				help,&nbsp;
				<a href="/register">
					become a BookBrainz editor!
				</a>
			</p>

			<p>
				BookBrainz relies on contributions from editors to expand
				the knowledge contained in the database. Editors can add
				new data to the site, fix any errors in the existing
				information, and create links between pieces of information.
			</p>

			<h2>Accessing the data</h2>
			<p>
				The BookBrainz data is freely available to everyone, for any use.
				Please see our <a href="/licensing"> licensing page</a> for more details.
			</p>
			<p>
				Regular database dumps (Postgres) can be found
				<a href="http://ftp.musicbrainz.org/pub/musicbrainz/bookbrainz/latest.sql.bz2"> at this address.</a>
			</p>
			<p>
				We also have a webservice (or API) under development with
				<a href="https://api.test.bookbrainz.org/1/docs/"> live documentation</a>.
			</p>

			<h2>Contact Us</h2>
			<div style={{
				alignItems: 'center',
				display: 'flex',
				justifyContent: 'space-evenly'
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
					Chat with us<br/>
					<small>(Matrix, IRC, Discord)</small>
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
					Forums
				</a>
				<FontAwesomeIcon
					className="margin-sides-1 contact-text"
					icon={faCircle}
				/>
				<a className="contact-text" href="https://x.com/BookBrainz">
					<FontAwesomeIcon
						className="contact-text"
						icon={faXTwitter}
						size="2x"
					/>
					X
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
					Email
				</a>
				<FontAwesomeIcon
					className="margin-sides-1 contact-text"
					icon={faCircle}
				/>
			</div>

			<h2>Our Story</h2>
			<p>
				BookBrainz was conceived in 2011, during a discussion in
				the MusicBrainz IRC channel. It was initially championed
				by&nbsp;
				<a href="https://github.com/ocharles">
					Oliver Charles
				</a> who was a core MusicBrainz developer at the time, and
				the code was written in Haskell. While a number of people
				contributed to this early version of BookBrainz, it lost
				momentum after a couple of years.
			</p>

			<p>
				Another MusicBrainz community member,&nbsp;
				<a href="https://github.com/Leftmostcat">
					Sean Burke
				</a>, who had been involved with BookBrainz from the
				beginning, rekindled the project in May 2014, starting from
				scratch using the node.js framework. Although there was an
				initial burst of activity and good progress made on the
				site design, after a month or so, Sean didn&rsquo;t have
				time to maintain the initial level of activity.
			</p>

			<p>
				Around the time of the annual MusicBrainz summit in 2014, a
				third MusicBrainz community member,&nbsp;
				<a href="https://github.com/LordSputnik">
					Ben Ockmore
				</a>, started to take an interest in the project. New
				discussions were held in the BookBrainz IRC channel, and
				progress was made on a new node.js site and webservice.
				After a couple of months, the decision was made to switch
				from node.js to Python for the webservice, and progress has
				continued steadily since then. Recently, in order to reduce
				duplication of code, it was decided to once again use
				node.js for all code, and work is ongoing to achieve this.
			</p>

			<p>
				In September 2018, a full-time position was opened
				for BookBrainz to become an official project of MetaBrainz,
				and,&nbsp;
				<a href="https://github.com/MonkeyDo">
					Nicolas Pelletier (AKA Monkey)
				</a> became the project lead.
			</p>

			<p>
				From the beginning, BookBrainz was closely tied with
				the&nbsp;
				<a href={NESLink}>
					New Edit System (NES)
				</a> for MusicBrainz, which was designed by Oliver to
				introduce a Git-style framework for managing contributions
				to MusicBrainz. Both projects were initially written in
				Haskell, and BookBrainz used an adapted version of NES as
				its edit system. The NES has also been the basis for the
				edit system in the current iteration of BookBrainz.
			</p>
		</div>
	);
}

AboutPage.displayName = 'AboutPage';

export default AboutPage;
