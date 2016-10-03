/*
 * Copyright (C) 2016  Ben Ockmore
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

import {Col, Row} from 'react-bootstrap';
import AliasButton from './alias-button-container';
import DisambiguationButton from './disambiguation-button-container';
import DisambiguationField from './disambiguation-field-container';
import IdentifierButton from './identifier-button';
import LanguageField from './language-field-container';
import NameField from './name-field-container';
import React from 'react';
import SortNameField from './sort-name-field-container';

function SharedData({
	disambiguationVisible,
	languageOptions
}) {
	return (
		<div>
			<h2>
				What is the Creator called?
			</h2>
			<form>
				<Row>
					<Col md={6} mdOffset={3}>
						<NameField/>
					</Col>
				</Row>
				<Row>
					<Col md={6} mdOffset={3}>
						<SortNameField/>
					</Col>
				</Row>
				<Row>
					<Col md={6} mdOffset={3}>
						<LanguageField
							options={languageOptions}
						/>
					</Col>
				</Row>
				<Row className="margin-top-1">
					<Col className="text-center" md={4}>
						<AliasButton/>
					</Col>
					<Col className="text-center" md={4}>
						<DisambiguationButton disabled={disambiguationVisible}/>
					</Col>
					<Col className="text-center" md={4}>
						<IdentifierButton/>
					</Col>
				</Row>
				<Row>
					<Col md={6} mdOffset={3}>
						{disambiguationVisible && <DisambiguationField/>}
					</Col>
				</Row>
			</form>
		</div>
	);
}
SharedData.displayName = 'SharedData';
SharedData.propTypes = {
	disambiguationVisible: React.PropTypes.bool,
	languageOptions: React.PropTypes.array
};

export default SharedData;
