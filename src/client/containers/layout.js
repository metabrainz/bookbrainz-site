/*
 * Copyright (C) 2018  Theodore Fabian Rudy
 * 				 2016  Daniel Hsing
 * 				 2016  Ben Ockmore
 * 				 2016  Sean Burke
 * 				 2016  Ohm Patel
 * 				 2015  Leo Verto
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
import {
	faBell, faChartLine, faGripVertical, faListUl, faPencilAlt,
	faPlus, faQuestionCircle, faSearch, faSignInAlt, faSignOutAlt,
	faTrophy, faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Footer from './../components/footer';
import InfiniteScroll from 'react-infinite-scroller';
import MergeQueue from '../components/pages/parts/merge-queue';
import PropTypes from 'prop-types';
import React from 'react';
import {forEach} from 'lodash';
import {genEntityIconHTMLElement} from '../helpers/entity';
import request from 'superagent';
import {timeAgo} from '../helpers/utils';


const {Alert, Button, Form, FormControl, InputGroup, Nav, Navbar, NavDropdown, Row, Spinner} = bootstrap;

class Layout extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasMore: true,
			keepMenuOpen: false,
			menuOpen: false,
			notifications: []
		};
		this.readNotificationUrl = '/subscription/read';
		this.renderNavContent = this.renderNavContent.bind(this);
		this.renderNavHeader = this.renderNavHeader.bind(this);
		this.renderNotifications = this.renderNotifications.bind(this);
		this.handleDropdownToggle = this.handleDropdownToggle.bind(this);
		this.handleDropdownClick = this.handleDropdownClick.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.fetchMoreNotifications = this.fetchMoreNotifications.bind(this);
		this.handleReadAllNotifications = this.handleReadAllNotifications.bind(this);
		this.genHandleOnClick = this.genHandleOnClick.bind(this);
		this.renderSingleNotification = this.renderSingleNotification.bind(this);
	}

	handleMouseDown(event) {
		event.preventDefault();
	}

	handleDropdownToggle(newValue) {
		if (this.state.keepMenuOpen) {
			this.setState({keepMenuOpen: false, menuOpen: true});
		}
		else {
			this.setState({menuOpen: newValue});
		}
	}

	handleDropdownClick(eventKey, event) {
		event.stopPropagation();
		this.setState({keepMenuOpen: true}, this.handleDropdownToggle);
	}

	genHandleOnClick(id, redirectUrl) {
		return () => {
			request.post(this.readNotificationUrl).send({0: id}).then(() => {
				window.location.href = redirectUrl;
			});
		};
	}

	async fetchMoreNotifications() {
		const res = await request.get(`/subscription/notifications?from=${this.state.notifications.length}&size=5`);
		const {notifications} = res.body;
		const allNotifications = [];
		forEach(notifications, (notification) => {
			allNotifications.push(notification);
		});
		if (notifications.length > 0) {
			this.setState((state) => {
				const newNotifications = notifications.concat(state.notifications);
				newNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
				return {...state, notifications: newNotifications};
			});
			return;
		}
		this.setState({hasMore: false});
	}

	renderNavHeader() {
		const {homepage} = this.props;

		return (
			<Navbar.Brand className="logo">
				<a href="/">
					{homepage ? (
						<img
							alt="BookBrainz icon"
							src="/images/BookBrainz_logo_icon.svg"
							title="BookBrainz"
						/>
					) : (
						<img
							alt="BookBrainz icon"
							src="/images/BookBrainz_logo_mini.svg"
							title="BookBrainz"
						/>
					)}
				</a>
			</Navbar.Brand>
		);
	}

	renderGuestDropdown() {
		const disableSignUp = this.props.disableSignUp ?
			{disabled: true} :
			{};

		return (
			<Nav>
				<Nav.Item>
					<Nav.Link {...disableSignUp} href="/auth">
						<FontAwesomeIcon icon={faSignInAlt}/>
						{' Sign In / Register'}
					</Nav.Link>
				</Nav.Item>
			</Nav>
		);
	}

	renderLoggedInDropdown() {
		const {user} = this.props;

		const createDropdownTitle = (
			<span>
				<FontAwesomeIcon icon={faPlus}/>
				{'  Add'}
			</span>
		);

		const userDropdownTitle = user && (
			<span>
				<FontAwesomeIcon icon={faUserCircle}/>
				{`  ${user.name}`}
			</span>
		);

		const disableSignUp = this.props.disableSignUp ?
			{disabled: true} :
			{};

		return (
			<Nav>
				<NavDropdown
					id="create-dropdown"
					open={this.state.menuOpen}
					title={createDropdownTitle}
					onMouseDown={this.handleMouseDown}
					onSelect={this.handleDropdownClick}
					onToggle={this.handleDropdownToggle}
				>
					<NavDropdown.Item href="/work/create">
						{genEntityIconHTMLElement('Work')}
						Work
					</NavDropdown.Item>
					<NavDropdown.Item href="/edition/create">
						{genEntityIconHTMLElement('Edition')}
						Edition
					</NavDropdown.Item>
					<NavDropdown.Item href="/edition-group/create">
						{genEntityIconHTMLElement('EditionGroup')}
						Edition Group
					</NavDropdown.Item>
					<NavDropdown.Item href="/series/create">
						{genEntityIconHTMLElement('Series')}
						Series
					</NavDropdown.Item>
					<NavDropdown.Divider/>
					<NavDropdown.Item href="/author/create">
						{genEntityIconHTMLElement('Author')}
						Author
					</NavDropdown.Item>
					<NavDropdown.Item href="/publisher/create">
						{genEntityIconHTMLElement('Publisher')}
						Publisher
					</NavDropdown.Item>
				</NavDropdown>
				<NavDropdown
					alignRight
					id="user-dropdown"
					title={userDropdownTitle}
					onMouseDown={this.handleMouseDown}
				>
					<NavDropdown.Item href={`/editor/${user.id}`}>
						<FontAwesomeIcon fixedWidth icon={faUserCircle}/>
						{' Profile'}
					</NavDropdown.Item>
					<NavDropdown.Item href={`/editor/${user.id}/revisions`}>
						<FontAwesomeIcon fixedWidth icon={faListUl}/>
						{' Revisions'}
					</NavDropdown.Item>
					<NavDropdown.Item href={`/editor/${user.id}/achievements`}>
						<FontAwesomeIcon fixedWidth icon={faTrophy}/>
						{' Achievements'}
					</NavDropdown.Item>
					<NavDropdown.Item href={`/editor/${user.id}/collections`}>
						<FontAwesomeIcon fixedWidth icon={faGripVertical}/>
						{' Collections'}
					</NavDropdown.Item>
					<NavDropdown.Item href="/help">
						<FontAwesomeIcon icon={faQuestionCircle}/>
						{' Help '}
					</NavDropdown.Item>
					<NavDropdown.Item {...disableSignUp} href="/logout">
						<FontAwesomeIcon fixedWidth icon={faSignOutAlt}/>
						{' Sign Out'}
					</NavDropdown.Item>
				</NavDropdown>
			</Nav>
		);
	}

	renderSearchForm() {
		return (
			<Form
				inline
				action="/search"
				className="ml-auto mr-3"
				role="search"
			>
				<InputGroup>
					<FormControl required name="q" placeholder="Search for..." type="text"/>
					<InputGroup.Append>
						<Button type="submit" variant="success">
							<FontAwesomeIcon icon={faSearch}/>
						</Button>
					</InputGroup.Append>
				</InputGroup>
			</Form>
		);
	}

	renderSingleNotification(notification) {
		const lastUpdatedDate = new Date(notification.timestamp);
		return (
			<NavDropdown.Item
				className={`notify-notification wrapword ${!notification.read ? 'notify-nread' : ''}`}
				href={notification.notificationRedirectLink}
				key={notification.id}
				onClick={this.genHandleOnClick(notification.id, notification.notificationRedirectLink)}
			>
				<span>
					<FontAwesomeIcon icon={faPencilAlt}/>
					{` ${notification.notificationText}`}
				</span>
				<small className="notify-date">{timeAgo(lastUpdatedDate)}</small>
			</NavDropdown.Item>
		);
	}

	handleReadAllNotifications() {
		const notificationsToRead = {};
		this.state.notifications.forEach((notification, index) => {
			notificationsToRead[index] = notification.id;
		});
		request.post(this.readNotificationUrl).send(notificationsToRead).then(window.location.reload);
	}

	renderNotifications() {
		const userNotificationsTitle = (
			<span>
				<FontAwesomeIcon icon={faBell}/>
				{' Notifications'}
			</span>);
		const loaderComponent = <h4 className="ml-4"> Loading <Spinner animation="border"/> </h4>;
		return (
			<Nav>
				<NavDropdown alighRight className="notify-container" title={userNotificationsTitle}>
					<Row className="notify-heading">
						<h4>Notifications</h4>
						<Button className="m-0 p-0" variant="link" onClick={this.handleReadAllNotifications}>Mark all as read</Button>
					</Row>
					<NavDropdown.Divider/>
					<InfiniteScroll
						className="notify-infscroll"
						hasMore={this.state.hasMore}
						loadMore={this.fetchMoreNotifications}
						loader={loaderComponent}
					>
						{this.state.notifications.map(this.renderSingleNotification)}
					</InfiniteScroll>
				</NavDropdown>
			</Nav>
		);
	}

	renderNavContent() {
		const {homepage, hideSearch, user} = this.props;

		/*
		 * GOTCHA: Usage of react-bootstrap FormGroup component inside
		 * Navbar.Form causes a DOM mutation
		 */
		const revisionsClassName = homepage || hideSearch ? 'ml-auto' : null;

		return (
			<Navbar.Collapse id="bs-example-navbar-collapse-1">
				{!(homepage || hideSearch) && this.renderSearchForm()}
				<Nav className={revisionsClassName}>
					<Nav.Item>
						<Nav.Link href="/revisions">
							<FontAwesomeIcon icon={faListUl}/>
							{' Revisions '}
						</Nav.Link>
					</Nav.Item>
				</Nav>
				{(user && user.id) && this.renderNotifications()}
				<Nav>
					<Nav.Item>
						<Nav.Link href="/collections">
							<FontAwesomeIcon icon={faGripVertical}/>
							{' Collections '}
						</Nav.Link>
					</Nav.Item>
				</Nav>
				<Nav>
					<Nav.Item>
						<Nav.Link href="/statistics">
							<FontAwesomeIcon icon={faChartLine}/>
							{' Statistics '}
						</Nav.Link>
					</Nav.Item>
				</Nav>
				{
					user && user.id ?
						this.renderLoggedInDropdown() : this.renderGuestDropdown()
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
			mergeQueue,
			requiresJS
		} = this.props;

		// Shallow merges parents props into child components
		const childNode = homepage ?
			children :
			(
				<div className="container" id="content">
					{requiresJS && (
						<div>
							<noscript>
								<div className="alert alert-danger" role="alert">
									This page will not function correctly without
									JavaScript! Please enable JavaScript to use this
									page.
								</div>
							</noscript>
						</div>
					)}
					{children}
					{mergeQueue ?
						<MergeQueue
							mergeQueue={mergeQueue}
						/> : null
					}
				</div>
			);

		const alerts = this.props.alerts.map((alert, idx) => (
			// eslint-disable-next-line react/no-array-index-key
			<Alert className="text-center" key={idx} variant={alert.level}>
				<p>{alert.message}</p>
			</Alert>
		));

		return (
			<div>
				<a className="sr-only sr-only-focusable" href="#content">
					Skip to main content
				</a>
				<Navbar className="BookBrainz" expand="lg" fixed="top" role="navigation">
					{this.renderNavHeader()}
					<Navbar.Toggle/>
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
	disableSignUp: PropTypes.bool,
	hideSearch: PropTypes.bool,
	homepage: PropTypes.bool,
	mergeQueue: PropTypes.object,
	repositoryUrl: PropTypes.string.isRequired,
	requiresJS: PropTypes.bool,
	siteRevision: PropTypes.string.isRequired,
	user: PropTypes.object
};
Layout.defaultProps = {
	disableSignUp: false,
	hideSearch: false,
	homepage: false,
	mergeQueue: null,
	requiresJS: false,
	user: null
};

export default Layout;
