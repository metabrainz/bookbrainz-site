/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2016  Ben Ockmore
 * 				 2016  Max Prettyjohns
 * 				 2016  Sean Burke
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

import React from 'react';
import bootstrap from 'react-bootstrap';

const {Col, Nav, NavItem, Row} = bootstrap;

function EditorContainer(props) {
	const {tabActive, editor, children} = props;

	return (
		<div>
			<Row>
				<Col md={12}>
					{editor.title ?
					<div>
						<a
							href=" "
							title={editor.title.description}
						>
							<h1>
								{`${editor.title.title} ${editor.name}`}
							</h1>
						</a>
					</div> :
					<h1>
						{editor.name}
					</h1>
					}
				</Col>
			</Row>
			<Row>
				<Col md={12}>
					<Nav bsStyle="tabs">
						<NavItem
							active={tabActive === 0}
							href={`/editor/${editor.id}`}
						>
							Profile
						</NavItem>
						<NavItem
							active={tabActive === 1}
							href={`/editor/${editor.id}/revisions`}
						>
							Revisions
						</NavItem>
						<NavItem
							active={tabActive === 2}
							href={`/editor/${editor.id}/achievements`}
						>
							Achievements
						</NavItem>
					</Nav>
				</Col>
			</Row>
			{children}
		</div>
	);
}

EditorContainer.displayName = 'EditorContainer';
EditorContainer.propTypes = {
	children: React.PropTypes.node.isRequired,
	editor: React.PropTypes.shape({
		id: React.PropTypes.number,
		name: React.PropTypes.string,
		title: React.PropTypes.object
	}).isRequired,
	tabActive: React.PropTypes.number.isRequired
};

export default EditorContainer;
