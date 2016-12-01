/*
 * Copyright (C) 2016  Max Prettyjohns
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

const bootstrap = require('react-bootstrap');
const Grid = bootstrap.Grid;
const Col = bootstrap.Col;
const Row = bootstrap.Row;

class Footer extends React.Component {

	render() {
		const repositoryUrl = this.props.repositoryUrl;
		const siteRevision = this.props.siteRevision;

		return (
			<div>
				<footer className="footer">
					<Grid fluid>
						<Row>
							<Col sm={4}>
								<small>Tested with <a href="https://www.browserstack.com/" target="_blank"><img alt="BrowserStack Logo" height="25" src="/images/BrowserStack.png"/></a></small>
							</Col>
							<Col className="text-center" sm={4}>
								<small>Cover image by <a href="https://commons.wikimedia.org/wiki/File:Bookshelf.jpg">Stewart Butterfield</a> (<a href="https://creativecommons.org/licenses/by/2.0/deed.en">CC-BY-2.0</a>)</small>
							</Col>
							<Col className="text-right" sm={4}>
								<a href="/privacy"><small>Privacy & Terms</small></a>
							</Col>
						</Row>
						<Row>
							<small>Alpha Software — <a href={`${repositoryUrl}commit/${siteRevision}`}>{siteRevision}</a> — <a href="#">Report a Bug</a></small>
						</Row>
					</Grid>
				</footer>
			</div>
		);
	}
}

Footer.displayName = 'Footer';
Footer.propTypes = {
	repositoryUrl: React.PropTypes.string,
	siteRevision: React.PropTypes.string
};

module.exports = Footer;
