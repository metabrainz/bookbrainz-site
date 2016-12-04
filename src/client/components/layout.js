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
const React = require('react');

const bootstrap = require('react-bootstrap');
const FontAwesome = require('react-fontawesome');

const Nav = bootstrap.Nav;
const Navbar = bootstrap.Navbar;
const MenuItem = bootstrap.MenuItem;
const FormGroup = bootstrap.FormGroup;

const Footer = require('./footer');


/**
 * Returns list of component children that have been injected with the specified
 * props (does not override existing ones)
 * @param {Object} props - The props object that contains children and will be
 * re-injected into children
 * @returns {Array} list of children
 */
function injectChildElemsWithProps(props) {
	'use strict';
	return React.Children.map(props.children, (Child) => {
		const filteredProps = Object.assign({}, props, Child.props);
		return React.cloneElement(Child, filteredProps);
	});
}

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
				<Navbar.Brand className="logo"
					href="/"
				>
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
				</Navbar.Brand>
				<Navbar.Toggle/>
			</Navbar.Header>
		);
	}

	renderNavContent() {
		const {user, homepage, hideSearch} = this.props;

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
					<FormGroup>
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
					</FormGroup>
				</Navbar.Form>
				}
			</Navbar.Collapse>
		);
	}

	render() {
		const {homepage, siteRevision, repositoryUrl} = this.props;

		// Shallow merges parents props into child components
		const children = homepage ? injectChildElemsWithProps(this.props) :
			<div className="container"
				id="content"
			>
				{injectChildElemsWithProps(this.props)}
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
				{children}
				<Footer repositoryUrl={repositoryUrl}
					siteRevision={siteRevision}
				/>
			</div>
		);
	}
}

Layout.displayName = 'Layout';
Layout.propTypes = {
	achievement: React.PropTypes.object,
	basedir: React.PropTypes.string,
	children: React.PropTypes.node,
	creatorTypes: React.PropTypes.array,
	editor: React.PropTypes.object,
	entity: React.PropTypes.object,
	genders: React.PropTypes.array,
	hideSearch: React.PropTypes.bool,
	homepage: React.PropTypes.bool,
	identifierTypes: React.PropTypes.array,
	languages: React.PropTypes.array,
	publicationTypes: React.PropTypes.array,
	publisherTypes: React.PropTypes.array,
	repositoryUrl: React.PropTypes.string,
	siteRevision: React.PropTypes.string,
	title: React.PropTypes.string,
	user: React.PropTypes.object,
	workTypes: React.PropTypes.array
};

module.exports = Layout;
