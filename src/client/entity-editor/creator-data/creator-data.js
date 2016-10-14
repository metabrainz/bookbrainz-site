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

import {Button, Col, Input, Row} from 'react-bootstrap';
import GenderField from './gender-field-container';
import TypeField from './type-field-container';
import BeginField from './begin-field-container';
import EndField from './end-field-container';
import EndedCheck from './ended-check-container';
import PartialDate from '../../components/input/partial-date';
import SubmitButton from '../common/submit-button';
import ErrorText from '../common/error-text';
import React from 'react';
import Select from 'react-select';
import ValidationLabel from '../common/validation-label';


function CreatorData({
	genderOptions,
	creatorTypes,
	submissionUrl
}) {
	return (
		<form>
			<h2>
				What else do you know about the Creator?
			</h2>
			<p className="text-muted">
				All fields optional — leave something blank if you don't
				know it
			</p>
			<Row>
				<Col md={6} mdOffset={3}>
					<TypeField options={creatorTypes}/>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<GenderField options={genderOptions}/>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<BeginField show/>
				</Col>
			</Row>
			<div className="text-center">
				<EndedCheck/>
			</div>
			<Row>
				<Col md={6} mdOffset={3}>
					<EndField/>
				</Col>
			</Row>
			<div className="text-center margin-top-1">
				<SubmitButton url={submissionUrl}/>
			</div>
			<div className="text-center margin-top-1">
				<ErrorText/>
			</div>
		</form>
	);
}
CreatorData.displayName = 'CreatorData';
CreatorData.propTypes = {

};

export default CreatorData;
