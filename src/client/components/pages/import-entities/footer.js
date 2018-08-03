/*
 * Copyright (C) 2018 Shivam Tripathi
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

function ImportFooter({importUrl, importedAt, source}) {
	return (
		<div>
			<Row>
				<Col md={6} mdOffset={3}>
					<ButtonGroup justified>
						<Button
							bsStyle="success"
							href={`${importUrl}/approve`}
							title="Upgrade"
						>
							<Icon name="check"/>&nbsp;Approve
						</Button>
						<Button
							bsStyle="warning"
							href={`${importUrl}/edit`}
							title="Edit"
						>
							<Icon name="pencil"/>&nbsp;Edit & Approve
						</Button>
						<Button
							bsStyle="danger"
							href={`${importUrl}/delete`}
							title="Discard"
						>
							<Icon name="remove"/>&nbsp;Discard
						</Button>
					</ButtonGroup>
				</Col>
			</Row>
			<div className="text-center margin-top-d10">
				<dl>
					<dt>Imported at</dt>
					<dd>{formatDate(new Date(importedAt))}</dd>
				</dl>
				<dl>
					<dt>Source</dt>
					<dd>{source}</dd>
				</dl>
			</div>
		</div>
	);
}
ImportFooter.displayName = 'ImportFooter';
ImportFooter.propTypes = {
	importUrl: PropTypes.string.isRequired,
	importedAt: PropTypes.string.isRequired,
	source: PropTypes.string.isRequired
};

export default ImportFooter;
