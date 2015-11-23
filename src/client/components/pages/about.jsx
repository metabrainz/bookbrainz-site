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

const React = require('react');
const PageHeader = require('react-bootstrap').PageHeader;

module.exports = React.createClass({
	displayName: 'AboutPage',
	render() {
		'use strict';

		const NESLink =
			'https://ocharles.org.uk/blog/posts/' +
				'2012-07-10-nes-does-it-better-1.html';

		return (
			<div>
				<PageHeader>About BookBrainz</PageHeader>
				<p className="lead">
					BookBrainz is an online encyclopaedia which contains
					information about published literature. Our aim is to
					collect and store data about every book, magazine, journal
					or other publication ever written.
				</p>

				<p>
					BookBrainz is developed by just a small team of volunteers,
					unlike the&nbsp;
					<a href="http://musicbrainz.org/">
						MusicBrainz encyclopaedia
					</a> on which it is based. Nevertheless, we are committed
					to making BookBrainz the definitive source of publication
					metadata. We hope to attract many contributors, who will be
					able to use their knowledge of literature to expand the
					database through our website. If you think you can
					help,&nbsp;
					<a href="/register">
						become a BookBrainz editor!
					</a>
				</p>

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

				<h2>How We Operate</h2>
				<p>
					The core components of BookBrainz are the site, the
					webservice and the database. All of these components are
					running on MetaBrainz's Sakura server, which also runs&nbsp;
					<a href="https://critiquebrainz.org/">
						CritiqueBrainz
					</a>.
				</p>

				<p>
					BookBrainz relies on contributions from editors to expand
					the knowledge contained in the database. Editors can add
					new data to the site, fix any errors in the existing
					information, and create links between pieces of information.
					To acknowledge this vital input, we make our data freely
					available to everyone, for any use. While we don&rsquo;t
					create regular database dumps at this early stage of the
					project, you&rsquo;re welcome to browse the site or use the
					webservice to access data.
				</p>
			</div>
		);
	}
});
