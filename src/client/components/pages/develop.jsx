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
	displayName: 'DevelopPage',
	render() {
		'use strict';

		return (
			<div>
				<PageHeader>Developing with BookBrainz</PageHeader>
				<p className="lead">
					We aim to make it as easy as possible to use the data
					stored in BookBrainz. If you&rsquo;re a developer wanting
					to make programs that depend on BookBrainz, we have a web
					service available, and are planning to release database
					dumps regularly at a later stage in the project.
				</p>

				<h2>Web Service</h2>
				<p>
					The web service is the primary way of getting BookBrainz
					data. The key advantage of using the web service over the
					dumps is that you don&rsquo;t need to install any database
					engine &mdash; you can access the data through the internet.
					The web service is documented in&nbsp;
					<a href="http://bbdocs-dev.readthedocs.org/en/latest/">
						our Developer Documentation.
					</a>.
				</p>

				<h2>Database Dumps</h2>
				<p>
					The database dumps will be useful if you need to process a
					lot of data quickly &mdash; in cases where the web service
					is not able to respond quickly enough. Unfortunately,
					we&rsquo;re not currently ready to provide database dumps,
					since BookBrainz is at a very early stage. However, when
					they are published, you&rsquo;ll be able to download them
					from this page, so be sure to check back occaisonally if
					this is something you&rsquo;re interested in.
				</p>
				<h2>Source Code</h2>
				<p>
					BookBrainz runs on open source software. If you wish to
					access the source, even contribute to the project, please
					see&nbsp;
					<a href="https://github.com/bookbrainz/">
						our github page
					</a>.
				</p>
			</div>
		);
	}
});
