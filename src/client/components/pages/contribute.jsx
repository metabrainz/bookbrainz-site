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
	displayName: 'ContributePage',
	render() {
		'use strict';

		const IRCLink = 'https://webchat.freenode.net/?channels=#metabrainz';

		return (
			<div>
				<PageHeader>Contributing to BookBrainz</PageHeader>
				<p className="lead">
					There are many ways that you can contribute to the
					BookBrainz online encyclopaedia, depending on where your
					particular skills lie.
				</p>

				<h2>Editing</h2>
				<p>
					If you come to BookBrainz with new information about a
					particular book, you&rsquo;ll want to edit the database. To
					do that, you&rsquo;ll first need an account, which you can
					get by&nbsp;
					<a href="/register">
						registering
					</a>. Then, you&rsquo;ll be able to add your new
					information by editing an entity. Note that in the current
					version of BookBrainz, only new entities can be edited.
					Please follow the&nbsp;
					<a href="http://musicbrainz.org/doc/Style">
						MusicBrainz style guidelines
					</a> (adapting as necessary) when adding your information.
				</p>

				<h2>Programming</h2>
				<p>
					If you&rsquo;re someone who&rsquo;s good at using
					JavaScript, Python, SQL or LESS/SASS, we&rsquo;d love to
					have your help developing BookBrainz. Take a look at our
					GitHub page at&nbsp;
					<a href="https://github.com/BookBrainz">
						BookBrainz
					</a> to check out our code and see if there are any issues
					that interest you.
				</p>
				<h2>Community</h2>
				<p>
					No matter whether you feel like you fit in one of these
					categories, think you can contribute in a different area, or
					just want to chat, feel free to drop in and meet us on the
					MetaBrainz&nbsp;
					<a href={IRCLink}>
						IRC channel
					</a>!
				</p>
			</div>
		);
	}
});
