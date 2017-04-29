/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2016  Ben Ockmore
 * 				 2016  Sean Burke
 * 				 2016  Ohm Patel
 *				 2015  Leo Verto
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
/* eslint max-len: "warn" */
import FontAwesome from 'react-fontawesome';
import Footer from './../components/footer';
import React from 'react';
import bootstrap from 'react-bootstrap';

const {MenuItem, Nav, Navbar} = bootstrap;

class Layout extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.renderNavContent = this.renderNavContent.bind(this);
		this.renderNavHeader = this.renderNavHeader.bind(this);
	}

	renderNavHeader() {
		const {homepage} = this.props;

		return (
			<Navbar.Header>
				<Navbar.Brand className="logo">
					<a href="/">
						{homepage ?
							<img alt="BookBrainz icon"
								src="/images/BookBrainz_logo_icon.svg"
								title="BookBrainz"
							/> :
							<img alt="BookBrainz icon"
								src="/images/BookBrainz_logo_mini.svg"
								title="BookBrainz"
							/>
						}
					</a>
				</Navbar.Brand>
				<Navbar.Toggle/>
			</Navbar.Header>
		);
	}

	renderNavContent() {
		const {user, homepage, hideSearch} = this.props;

		/* GOTCHA: Usage of react-bootstrap FormGroup component inside
		*  Navbar.Form causes a DOM mutation
		*/
		return (
			<Navbar.Collapse id="bs-example-navbar-collapse-1">
				{user && user.id ?
					<Nav pullRight>
						<li className="dropdown">
							<a aria-expanded="false"
								className="dropdown-toggle"
								data-toggle="dropdown"
								href="#"
								id="dNewEntities"
								role="button"
							>
								<FontAwesome name="plus"/>{' Create '}
								<span className="caret"/>
							</a>
							<ul
								aria-labelledby="dNewEntities"
								className="dropdown-menu"
								role="menu"
							>
								<MenuItem href="/publication/create">
									Create Publication
								</MenuItem>
								<MenuItem href="/edition/create">
									Create Edition
								</MenuItem>
								<MenuItem href="/work/create">
									Create Work
								</MenuItem>
								<li className="divider"/>
								<MenuItem href="/creator/create">
									Create Creator
								</MenuItem>
								<MenuItem href="/publisher/create">
									Create Publisher
								</MenuItem>
							</ul>
						</li>
						<li className="dropdown">
							<a aria-expanded="false"
								className="dropdown-toggle"
								data-toggle="dropdown"
								href="#"
								id="dUserDropdown"
								role="button"
							>
								<FontAwesome name="user"/>
								<span>{`  ${user.name}`}</span>
								<span className="caret"/>
							</a>
							<ul aria-labelledby="dUserDropdown"
								className="dropdown-menu"
								role="menu"
							>
								<MenuItem href={`/editor/${user.id}`}>
									<FontAwesome fixedWidth
										name="info"
									/>{' Profile'}
								</MenuItem>
								<MenuItem href="/logout">
									<FontAwesome fixedWidth
										name="sign-out"
									/>{' Sign Out'}
								</MenuItem>
							</ul>
						</li>
					</Nav> :
					<Nav pullRight>
						<MenuItem href="/auth">
							<FontAwesome name="sign-in"/>{' Sign In / Register'}
						</MenuItem>
					</Nav>
				}
				{!(homepage || hideSearch) &&
				<Navbar.Form pullRight
					 action="/search"
					 role="search"
				>
					<div className="form-group">
						<div className="input-group">
							<input className="form-control"
								   name="q"
								   placeholder="Search for..."
								   type="text"
							/>
							<span className="input-group-btn">
									<button className="btn btn-success"
										type="submit"
									>
										<FontAwesome name="search"/>
									</button>
								</span>
						</div>
					</div>
				</Navbar.Form>
				}
			</Navbar.Collapse>
		);
	}

	render() {
		const {homepage, siteRevision, repositoryUrl, children} = this.props;

		// Shallow merges parents props into child components
		const childNode = homepage ? children :
			<div className="container"
				id="content"
			>
				{children}
			</div>;

		return (
			<div>
				<a className="sr-only sr-only-focusable"
					href="#content"
				>Skip to main content</a>
				<Navbar fixedTop
					fluid
					className="BookBrainz"
					role="navigation"
				>
					{this.renderNavHeader()}
					{this.renderNavContent()}
				</Navbar>
				{childNode}
				<Footer repositoryUrl={repositoryUrl}
					siteRevision={siteRevision}
				/>
			</div>
		);
	}
}

Layout.displayName = 'Layout';
Layout.propTypes = {
	children: React.PropTypes.node.isRequired,
	hideSearch: React.PropTypes.bool,
	homepage: React.PropTypes.bool,
	repositoryUrl: React.PropTypes.string.isRequired,
	siteRevision: React.PropTypes.string.isRequired,
	user: React.PropTypes.object
};
Layout.defaultProps = {
	hideSearch: false,
	homepage: false,
	user: null
};

export default Layout;
