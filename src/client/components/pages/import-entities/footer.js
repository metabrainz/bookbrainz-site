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

import {faCheck, faPencil, faRemove} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {startCase} from 'lodash';


const {formatDate} = utilsHelper;
const {
	Alert, Button, ButtonGroup, Col, Row, Tooltip
} = bootstrap;

function ImportFooter({importUrl, importedAt, source, type, hasVoted}) {
	const tooltip = (
		<Tooltip id="tooltip">
		  <strong>You can only vote once to discard an import.</strong>
		</Tooltip>
	  );

	return (
		<div>
			<Row>
				<Col>
					<Alert
						className="text-center font-weight-bold"
						variant="success"
					>
						This {startCase(type.toLowerCase())} has been automatically added.{' '}
						Kindly approve/discard it to help us improve our data.
					</Alert>
				</Col>
			</Row>
			<Row>
				<Col className="text-center" md={{offset: 3, span: 6}}>
					<ButtonGroup>
						<Button
							href={`${importUrl}/approve`}
							title="Approve"
							variant="success"
						>
							<FontAwesomeIcon icon={faCheck}/>&nbsp;Approve
						</Button>
						<Button
							href={`${importUrl}/edit`}
							title="Edit & Approve"
							variant="warning"
						>
							<FontAwesomeIcon icon={faPencil}/>&nbsp;Edit & Approve
						</Button>
						<Button
							disabled={hasVoted}
							href={`${importUrl}/discard`}
							overlay={hasVoted ? tooltip : null}
							title="Discard"
							variant="danger"
						>
							<FontAwesomeIcon icon={faRemove}/>&nbsp;Discard
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
	hasVoted: PropTypes.bool.isRequired,
	importUrl: PropTypes.string.isRequired,
	importedAt: PropTypes.string.isRequired,
	source: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired
};

export default ImportFooter;
