/*
 * Copyright (C) 2018  Theodore Fabian Rudy
 * 				 2016  Daniel Hsing
 * 				 2016  Ben Ockmore
 * 				 2016  Sean Burke
 * 				 2016  Ohm Patel
 * 				 2015  Leo Verto
 * 				 2023  Shivam Awasthi
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
import {IdentifierTypeEditorIcon, RelationshipTypeEditorIcon} from '../helpers/utils';
import {PrivilegeType, checkPrivilege} from '../../common/helpers/privileges-utils';
import {
	faBarcode,
	faChartLine, faClipboardQuestion, faFileLines, faGripVertical, faLink, faListUl, faNewspaper, faPlus, faQuestionCircle,
	faSearch, faShieldHalved, faSignInAlt, faSignOutAlt, faTrophy, faUserCircle, faUserGear
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Footer from './../components/footer';
import {I18nextProvider} from 'react-i18next';
import MergeQueue from '../components/pages/parts/merge-queue';
import PropTypes from 'prop-types';
import React from 'react';
import {createI18n} from '../../common/i18n/i18n';
import {faSearchengin} from '@fortawesome/free-brands-svg-icons';
import {genEntityIconHTMLElement} from '../helpers/entity';


const {Alert, Button, Form, FormControl, InputGroup, Nav, Navbar, NavDropdown} = bootstrap;

class Layout extends React.Component {
	constructor(props) {
		super(props);
		this.state = {keepMenuOpen: false, menuOpen: false};
		this.renderNavContent = this.renderNavContent.bind(this);
		this.renderNavHeader = this.renderNavHeader.bind(this);
		this.renderDocsDropdown = this.renderDocsDropdown.bind(this);
		this.handleDropdownToggle = this.handleDropdownToggle.bind(this);
		this.handleDropdownClick = this.handleDropdownClick.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		const i18nConfig = props.i18n || {locale: 'en', resources: {}};
		this.i18n = createI18n(i18nConfig.locale, i18nConfig.resources);
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

	renderDocsDropdown() {
		// eslint-disable-next-line id-length
		const translate = this.i18n.t.bind(this.i18n);
		const docsDropdownTitle = (
			<span>
				<FontAwesomeIcon icon={faFileLines}/>
				{`  ${translate('nav.docs')}`}
			</span>
		);
		return (
			<Nav>
				<NavDropdown
					alignRight
					id="docs-dropdown"
					title={docsDropdownTitle}
					onMouseDown={this.handleMouseDown}
				>
					<NavDropdown.Item href="/help">
						<FontAwesomeIcon fixedWidth icon={faQuestionCircle}/>
						{` ${translate('nav.help')} `}
					</NavDropdown.Item>
					<NavDropdown.Item href="/faq">
						<FontAwesomeIcon fixedWidth icon={faClipboardQuestion}/>
						{` ${translate('nav.faqs')} `}
					</NavDropdown.Item>
					<NavDropdown.Item href="/relationship-types">
						<FontAwesomeIcon fixedWidth icon={faLink}/>
						{` ${translate('nav.relationshipTypes')} `}
					</NavDropdown.Item>
					<NavDropdown.Item href="/identifier-types">
						<FontAwesomeIcon fixedWidth icon={faBarcode}/>
						{` ${translate('nav.identifierTypes')} `}
					</NavDropdown.Item>
				</NavDropdown>
			</Nav>
		);
	}

	renderGuestDropdown() {
		// eslint-disable-next-line id-length
		const translate = this.i18n.t.bind(this.i18n);
		const disableSignUp = this.props.disableSignUp ?
			{disabled: true} :
			{};

		return (
			<Nav>
				<Nav.Item>
					<Nav.Link {...disableSignUp} href="/auth">
						<FontAwesomeIcon icon={faSignInAlt}/>
						{` ${translate('auth.signInRegister')}`}
					</Nav.Link>
				</Nav.Item>
			</Nav>
		);
	}

	renderLoggedInDropdown() {
		// eslint-disable-next-line id-length
		const translate = this.i18n.t.bind(this.i18n);
		const {user} = this.props;

		const createDropdownTitle = (
			<span>
				<FontAwesomeIcon icon={faPlus}/>
				{`  ${translate('button.add')}`}
			</span>
		);

		const userDropdownTitle = user && (
			<span>
				<FontAwesomeIcon icon={faUserCircle}/>
				{`  ${user.name}`}
			</span>
		);

		const privilegesDropdownTitle = (
			<span>
				<FontAwesomeIcon className="margin-right-0-3" icon={faShieldHalved}/>
				{translate('privileges')}
			</span>
		);

		const showPrivilegeDropdown = user.privs > 1;
		const adminOptions = (
			<>
				<NavDropdown.Item href="/admin-panel">
					<FontAwesomeIcon fixedWidth className="margin-right-0-3" icon={faUserGear}/>
					{translate('nav.adminPanel')}
				</NavDropdown.Item>
				<NavDropdown.Item href="/admin-logs">
					<FontAwesomeIcon fixedWidth className="margin-right-0-3" icon={faNewspaper}/>
					{translate('nav.adminLogs')}
				</NavDropdown.Item>
			</>
		);

		const relationshipTypeEditorOptions = (
			<>
				<NavDropdown.Item href="/relationship-type/create">
					{RelationshipTypeEditorIcon}
					{translate('nav.addRelationshipType')}
				</NavDropdown.Item>
			</>
		);

		const reindexSearchEngineOption = (
			<>
				<NavDropdown.Item href="/search-admin">
					<FontAwesomeIcon fixedWidth className="margin-right-0-3" icon={faSearchengin}/>
					{translate('nav.searchAdmin')}
				</NavDropdown.Item>
			</>
		);

		const identifierTypeEditorOptions = (
			<>
				<NavDropdown.Item href="/identifier-type/create">
					{IdentifierTypeEditorIcon}
					{translate('nav.addIdentifierType')}
				</NavDropdown.Item>
			</>
		);

		const privilegeDropDown = (
			<NavDropdown
				alignRight
				id="privs-dropdown"
				title={privilegesDropdownTitle}
				onMouseDown={this.handleMouseDown}
			>
				{checkPrivilege(user.privs, PrivilegeType.ADMIN) && adminOptions}
				{checkPrivilege(user.privs, PrivilegeType.RELATIONSHIP_TYPE_EDITOR) && relationshipTypeEditorOptions}
				{checkPrivilege(user.privs, PrivilegeType.IDENTIFIER_TYPE_EDITOR) && identifierTypeEditorOptions}
				{checkPrivilege(user.privs, PrivilegeType.REINDEX_SEARCH_SERVER) && reindexSearchEngineOption}
			</NavDropdown>
		);

		const disableSignUp = this.props.disableSignUp ?
			{disabled: true} :
			{};

		return (
			<Nav>
				{showPrivilegeDropdown && privilegeDropDown}
				<NavDropdown
					alignRight
					id="create-dropdown"
					open={this.state.menuOpen}
					title={createDropdownTitle}
					onMouseDown={this.handleMouseDown}
					onSelect={this.handleDropdownClick}
					onToggle={this.handleDropdownToggle}
				>
					<NavDropdown.Item href="/create">
						{genEntityIconHTMLElement('Book')}
						{translate('entityType.book')}
					</NavDropdown.Item>
					<NavDropdown.Divider/>
					<NavDropdown.Item href="/work/create">
						{genEntityIconHTMLElement('Work')}
						{translate('entityType.work')}
					</NavDropdown.Item>
					<NavDropdown.Item href="/edition/create">
						{genEntityIconHTMLElement('Edition')}
						{translate('entityType.edition')}
					</NavDropdown.Item>
					<NavDropdown.Item href="/edition-group/create">
						{genEntityIconHTMLElement('EditionGroup')}
						{translate('entityType.editionGroup')}
					</NavDropdown.Item>
					<NavDropdown.Item href="/series/create">
						{genEntityIconHTMLElement('Series')}
						{translate('entityType.series')}
					</NavDropdown.Item>
					<NavDropdown.Item href="/author/create">
						{genEntityIconHTMLElement('Author')}
						{translate('entityType.author')}
					</NavDropdown.Item>
					<NavDropdown.Item href="/publisher/create">
						{genEntityIconHTMLElement('Publisher')}
						{translate('entityType.publisher')}
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
						{` ${translate('nav.profile')}`}
					</NavDropdown.Item>
					<NavDropdown.Item href={`/editor/${user.id}/revisions`}>
						<FontAwesomeIcon fixedWidth icon={faListUl}/>
						{` ${translate('nav.revisions')}`}
					</NavDropdown.Item>
					<NavDropdown.Item href={`/editor/${user.id}/achievements`}>
						<FontAwesomeIcon fixedWidth icon={faTrophy}/>
						{` ${translate('nav.achievements')}`}
					</NavDropdown.Item>
					<NavDropdown.Item href={`/editor/${user.id}/collections`}>
						<FontAwesomeIcon fixedWidth icon={faGripVertical}/>
						{` ${translate('entityType.collection_plural')}`}
					</NavDropdown.Item>
					<NavDropdown.Item href="/external-service/">
						<FontAwesomeIcon fixedWidth icon={faLink}/>
						{` ${translate('nav.externalServices')}`}
					</NavDropdown.Item>
					<NavDropdown.Item {...disableSignUp} href="/logout">
						<FontAwesomeIcon fixedWidth icon={faSignOutAlt}/>
						{` ${translate('auth.signOut')}`}
					</NavDropdown.Item>
				</NavDropdown>
			</Nav>
		);
	}

	renderSearchForm() {
		// eslint-disable-next-line id-length
		const translate = this.i18n.t.bind(this.i18n);
		return (
			<Form
				inline
				action="/search"
				className="ml-auto mr-3"
				role="search"
			>
				<InputGroup>
					<FormControl required name="q" placeholder={translate('nav.searchPlaceholder')} type="text"/>
					<InputGroup.Append>
						<Button type="submit" variant="success">
							<FontAwesomeIcon icon={faSearch}/>
						</Button>
					</InputGroup.Append>
				</InputGroup>
			</Form>
		);
	}

	renderNavContent() {
		// eslint-disable-next-line id-length
		const translate = this.i18n.t.bind(this.i18n);
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
							{` ${translate('nav.revisions')} `}
						</Nav.Link>
					</Nav.Item>
				</Nav>
				<Nav>
					<Nav.Item>
						<Nav.Link href="/collections">
							<FontAwesomeIcon icon={faGripVertical}/>
							{` ${translate('entityType.collection_plural')} `}
						</Nav.Link>
					</Nav.Item>
				</Nav>
				<Nav>
					<Nav.Item>
						<Nav.Link href="/statistics">
							<FontAwesomeIcon icon={faChartLine}/>
							{` ${translate('nav.statistics')} `}
						</Nav.Link>
					</Nav.Item>
				</Nav>
				{this.renderDocsDropdown()}
				{
					user && user.id ?
						this.renderLoggedInDropdown() : this.renderGuestDropdown()
				}
			</Navbar.Collapse>
		);
	}

	render() {
		// eslint-disable-next-line id-length
		const translate = this.i18n.t.bind(this.i18n);
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
									{translate('nav.noscriptWarning')}
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
			<I18nextProvider i18n={this.i18n}>
				<div>
					<a className="sr-only sr-only-focusable" href="#content">
						{translate('nav.skipToContent')}
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
			</I18nextProvider>
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
	i18n: PropTypes.object,
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
	i18n: null,
	mergeQueue: null,
	requiresJS: false,
	user: null
};

export default Layout;
