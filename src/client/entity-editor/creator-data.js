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

import {Button, Col, Input, Panel, Row} from 'react-bootstrap';

import DisambiguationButton from './disambiguation-button';
import DisambiguationField from './disambiguation-field';
import LanguageField from './language-field';
import NameField from './name-field';
import PartialDate from '../components/input/partial-date.jsx';
import React from 'react';
import Select from 'react-select';
import SortNameField from './sort-name-field';
import ValidationLabel from './validation-label';
import {connect} from 'react-redux';

let CreatorData = ({
	disambiguationVisible,
	languageOptions
}) => {
	const languageOptionsForDisplay = languageOptions.map((language) => ({
		value: language.id,
		label: language.name
	}));

	return (
		<Panel>
			<h2>
				What is the Creator called?
			</h2>
			<form>
				<NameField/>
				<SortNameField/>
				<LanguageField languageOptions={languageOptionsForDisplay}/>
				<Row className="margin-top-1">
					<DisambiguationButton disabled={disambiguationVisible}/>
					<Col
						className="text-center"
						md={4}
					>
						<Button bsStyle="link">Add more aliases…</Button>
					</Col>
				</Row>
				{disambiguationVisible && <DisambiguationField/>}
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
						<Input
							label="Gender"
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
		</Panel>
	);
};
CreatorData.displayName = 'CreatorData';
CreatorData.propTypes = {
	disambiguationVisible: React.PropTypes.bool,
	languageOptions: React.PropTypes.array
};

CreatorData = connect(
	(state) => ({
		disambiguationVisible: state.get('disambiguationVisible')
	})
)(CreatorData);

export default CreatorData;
