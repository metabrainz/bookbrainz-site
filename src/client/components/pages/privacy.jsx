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
	displayName: 'PrivacyPage',
	render() {
		'use strict';

		return (
			<div>
				<PageHeader>Privacy</PageHeader>
				<p>
					For a privacy policy, please see&nbsp;
					<a href="http://musicbrainz.org/doc/About/Privacy_Policy">
						http://musicbrainz.org/doc/About/Privacy_Policy
					</a>
				</p>

				<p>
					While this currently does not apply to BookBrainz, it
					gives an idea of what can be expected when it gets updated
					to cover all MetaBrainz projects. If you&rsquo;re happy
					using MusicBrainz, we aim to make you just as comfortable
					using BookBrainz.
				</p>
			</div>
		);
	}
});
