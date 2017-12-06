/*
 * Copyright (C) 2017  Ben Ockmore
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
import * as utilsHelper from '../../../helpers/utils';

import Icon from 'react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';


const {formatDate} = utilsHelper;
const {
	Button, ButtonGroup, Col, Row
} = bootstrap;

function EntityFooter({entityUrl, lastModified}) {
	return (
		<div>
			<Row>
				<Col md={6} mdOffset={3}>
					<ButtonGroup justified>
						<Button
							bsStyle="warning"
							href={`${entityUrl}/edit`}
							title="Edit Entity"
						>
							<Icon name="pencil"/>&nbsp;Edit
						</Button>
						<Button
							bsStyle="primary"
							href={`${entityUrl}/revisions`}
							title="Revision History"
						>
							<Icon name="history"/>&nbsp;History
						</Button>
						<Button
							bsStyle="danger"
							href={`${entityUrl}/delete`}
							title="Delete Entity"
						>
							<Icon name="remove"/>&nbsp;Delete
						</Button>
					</ButtonGroup>
				</Col>
			</Row>
			<div className="text-center margin-top-d10">
				<dl>
					<dt>Last Modified</dt>
					<dd>{formatDate(new Date(lastModified))}</dd>
				</dl>
			</div>
		</div>
	);
}
EntityFooter.displayName = 'EntityFooter';
EntityFooter.propTypes = {
	entityUrl: PropTypes.string.isRequired,
	lastModified: PropTypes.string.isRequired
};

export default EntityFooter;
