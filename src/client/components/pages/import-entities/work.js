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
import * as importHelper from '../../../helpers/import-entity';

import EntityImage from '../entities/image';
import EntityLinks from '../entities/links';
import ImportFooter from './footer';
import ImportTitle from './title';
import PropTypes from 'prop-types';
import React from 'react';
import {WorkAttributes} from '../entities/work';
import _ from 'lodash';


const {getImportUrl} = importHelper;
const {Alert, Col, Row} = bootstrap;


function ImportWorkDisplayPage({importEntity, identifierTypes}) {
	const urlPrefix = getImportUrl(importEntity);
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" md={2}>
					<EntityImage
						backupIcon="file-text-o"
						imageUrl={importEntity.imageUrl}
					/>
				</Col>
				<Col md={10}>
					<ImportTitle importEntity={importEntity}/>
					<WorkAttributes work={importEntity}/>
				</Col>
			</Row>
			<EntityLinks
				entity={importEntity}
				identifierTypes={identifierTypes}
				urlPrefix={urlPrefix}
			/>
			<hr className="margin-top-d40"/>
			<Row>
				<Alert
					bsStyle="success"
					className="text-center"
					style={{fontWeight: 'bold'}}
				>
					{`This ${_.startCase(importEntity.type.toLowerCase())} `}
					{'has been automatically added. Kindly approve/discard it '}
					{'to help us improve our data.'}
				</Alert>
			</Row>
			<ImportFooter
				hasVoted={importEntity.hasVoted}
				importUrl={urlPrefix}
				importedAt={importEntity.importedAt}
				source={importEntity.source}
			/>
		</div>
	);
}
ImportWorkDisplayPage.displayName = 'ImportWorkDisplayPage';
ImportWorkDisplayPage.propTypes = {
	identifierTypes: PropTypes.array,
	importEntity: PropTypes.object.isRequired
};
ImportWorkDisplayPage.defaultProps = {
	identifierTypes: []
};

export default ImportWorkDisplayPage;
