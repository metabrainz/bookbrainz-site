/*
 * Copyright (C) 2020  Nicolas Pelletier
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

import {Button, Col, Collapse, Row} from 'react-bootstrap';
import {formatDate, stringToHTMLWithLinks} from '../../../helpers/utils';
import PropTypes from 'prop-types';
import React from 'react';


class EntityAnnotation extends React.Component {
	constructor(props) {
	  super(props);

	  this.state = {
			open: false
	  };
	}

	handleToggleCollapse = () => {
		this.setState(prevState => ({open: !prevState.open}));
	};

	render() {
		const {annotation} = this.props.entity;
		if (!annotation || !annotation.content) {
			return null;
		}
		const lastModifiedDate = new Date(annotation.lastRevision.createdAt);
		return (
			<Row>
				<Col md={12}>
					<h2>Annotation</h2>
					<Collapse in={this.state.open}>
						<pre className="annotation-content">{stringToHTMLWithLinks(annotation.content)}</pre>
					</Collapse>
					<Button variant="link" onClick={this.handleToggleCollapse}>
						Show {this.state.open ? 'less' : 'more…'}
					</Button>
					<p className="text-muted">Last modified: <span title={formatDate(lastModifiedDate, true)}>{formatDate(lastModifiedDate)}</span>
						<span className="small"> (revision <a href={`/revision/${annotation.lastRevisionId}`}>#{annotation.lastRevisionId}</a>)</span>
					</p>
				</Col>
			</Row>
		);
	}
}
EntityAnnotation.displayName = 'EntityAnnotation';
EntityAnnotation.propTypes = {
	entity: PropTypes.object.isRequired
};

export default EntityAnnotation;
