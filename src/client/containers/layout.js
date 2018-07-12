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
import * as bootstrap from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import Footer from './../components/footer';
import PropTypes from 'prop-types';
import React from 'react';


const {Alert, MenuItem, Nav, Navbar, NavItem, NavDropdown} = bootstrap;

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
							<img
								alt="BookBrainz icon"
								src="/images/BookBrainz_logo_icon.svg"
								title="BookBrainz"
							/> :
							<img
								alt="BookBrainz icon"
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

		/*
		 * GOTCHA: Usage of react-bootstrap FormGroup component inside
		 * Navbar.Form causes a DOM mutation
		 */
		const createDropdownTitle = (
			<span>
				<FontAwesome name="plus"/>{'  Create'}
			</span>
		);

		const userDropdownTitle = user && (
			<span>
				<FontAwesome name="user"/>
				{`  ${user.name}`}
			</span>
		);

		return (
			<Navbar.Collapse id="bs-example-navbar-collapse-1">
				{user && user.id ?
					<Nav pullRight>
						<NavDropdown
							eventKey={1}
							id="create-dropdown"
							title={createDropdownTitle}
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
							<MenuItem divider/>
							<MenuItem href="/creator/create">
								Create Creator
							</MenuItem>
							<MenuItem href="/publisher/create">
								Create Publisher
							</MenuItem>
						</NavDropdown>
						<NavDropdown
							eventKey={2}
							id="user-dropdown"
							title={userDropdownTitle}
						>
							<MenuItem href={`/editor/${user.id}`}>
								<FontAwesome
									fixedWidth
									name="info"
								/>{' Profile'}
							</MenuItem>
							<MenuItem href="/logout">
								<FontAwesome
									fixedWidth
									name="sign-out"
								/>{' Sign Out'}
							</MenuItem>
						</NavDropdown>
					</Nav> :
					<Nav pullRight>
						<NavItem href="/auth">
							<FontAwesome name="sign-in"/>{' Sign In / Register'}
						</NavItem>
					</Nav>
				}
				<Nav pullRight>
					<NavItem href="/statistics">
						<FontAwesome name="statistics"/>
						{' Statistics '}
					</NavItem>
				</Nav>
				<Nav pullRight>
					<NavItem href="/imports/recent">
						<FontAwesome name="user-check"/>
						{' Review recent imports '}
					</NavItem>
				</Nav>
				{!(homepage || hideSearch) &&
				<form
					action="/search"
					className="navbar-form navbar-right"
					role="search"
				>
					<div className="form-group">
						<div className="input-group">
							<input
								className="form-control"
								name="q"
								placeholder="Search for..."
								type="text"
							/>
							<span className="input-group-btn">
								<button
									className="btn btn-success"
									type="submit"
								>
									<FontAwesome name="search"/>
								</button>
							</span>
						</div>
					</div>
				</form>
				}
			</Navbar.Collapse>
		);
	}

	render() {
		const {
			homepage,
			siteRevision,
			repositoryUrl,
			children,
			requiresJS
		} = this.props;

		// Shallow merges parents props into child components
		const childNode = homepage ? children : (
			<div className="container" id="content">
				{requiresJS &&
					<div>
						<noscript>
							<div className="alert alert-danger" role="alert">
								This page will not function correctly without
								JavaScript! Please enable JavaScript to use
								this page.
							</div>
						</noscript>
					</div>
				}
				{children}
			</div>
		);

		const alerts = this.props.alerts.map(
			(alert, idx) => (
				<Alert
					bsStyle={alert.level}
					className="text-center"
					key={idx}
				>
					<p>{alert.message}</p>
				</Alert>
			)
		);

		return (
			<div>
				<a className="sr-only sr-only-focusable" href="#content">
					Skip to main content
				</a>
				<Navbar
					fixedTop
					fluid
					className="BookBrainz"
					role="navigation"
				>
					{this.renderNavHeader()}
					{this.renderNavContent()}
				</Navbar>
				{alerts}
				{childNode}
				<Footer
					repositoryUrl={repositoryUrl}
					siteRevision={siteRevision}
				/>
			</div>
		);
	}
}

Layout.displayName = 'Layout';
Layout.propTypes = {
	alerts: PropTypes.array.isRequired,
	children: PropTypes.node.isRequired,
	hideSearch: PropTypes.bool,
	homepage: PropTypes.bool,
	repositoryUrl: PropTypes.string.isRequired,
	requiresJS: PropTypes.bool,
	siteRevision: PropTypes.string.isRequired,
	user: PropTypes.object
};
Layout.defaultProps = {
	hideSearch: false,
	homepage: false,
	requiresJS: false,
	user: null
};

export default Layout;
