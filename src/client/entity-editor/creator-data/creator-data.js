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
import PartialDate from '../../components/input/partial-date';
import React from 'react';
import Select from 'react-select';
import ValidationLabel from '../common/validation-label';


function CreatorData({
	genderOptions
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
				<Col
					md={6}
					mdOffset={3}
				>
					<GenderField options={genderOptions}/>
				</Col>
			</Row>
			<Row>
				<Col
					md={6}
					mdOffset={3}
				>
					<Input
						label="Type"
					>
						<Select
							options={[{
								value: 1,
								label: 'Hello'
							}]}
						/>
					</Input>
				</Col>
			</Row>
			<Row>
				<Col
					md={6}
					mdOffset={3}
				>
					<PartialDate
						label={
							<ValidationLabel empty>
								Date of Birth
							</ValidationLabel>
						}
						type="text"
					/>
				</Col>
			</Row>
			<div className="text-center">
				<Input
					label="Died?"
					type="checkbox"
					wrapperClassName="margin-top-0"
				/>
			</div>
			<Row>
				<Col
					md={6}
					mdOffset={3}
				>
					<PartialDate
						label={
							<ValidationLabel empty>
								Date of Death
							</ValidationLabel>
						}
						type="text"
					/>
				</Col>
			</Row>
			<div className="text-center margin-top-1">
				<a>Add identifiers (eg. MBID, Wikidata ID)…</a>
			</div>
			<div className="text-center margin-top-1">
				<Button bsStyle="success">
					Preview and Submit
				</Button>
			</div>
		</form>
	);
}
CreatorData.displayName = 'CreatorData';
CreatorData.propTypes = {

};

export default CreatorData;
