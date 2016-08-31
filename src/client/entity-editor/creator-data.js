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

import AliasButton from './alias-button-container';
import AliasEditor from './alias-editor/alias-editor';
import DisambiguationButton from './disambiguation-button-container';
import DisambiguationField from './disambiguation-field-container';
import LanguageField from './language-field-container';
import NameField from './name-field-container';
import PartialDate from '../components/input/partial-date.jsx';
import React from 'react';
import Select from 'react-select';
import SortNameField from './sort-name-field-container';
import ValidationLabel from './validation-label';
import {connect} from 'react-redux';


let CreatorData = ({
	aliasEditorVisible,
	disambiguationVisible,
	languageOptions
}) => {
	const languageOptionsForDisplay = languageOptions.map((language) => ({
		value: language.id,
		label: language.name
	}));

	return (
		<Panel>
			<AliasEditor
				languageOptions={languageOptionsForDisplay}
				show={aliasEditorVisible}
			/>
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
							options={languageOptionsForDisplay}
						/>
					</Col>
				</Row>
				<Row className="margin-top-1">
					<Col className="text-center" md={4} mdOffset={4}>
						<DisambiguationButton disabled={disambiguationVisible}/>
					</Col>
					<Col className="text-center" md={4}>
						<AliasButton/>
					</Col>
				</Row>
				<Row>
					<Col md={6} mdOffset={3}>
						{disambiguationVisible && <DisambiguationField/>}
					</Col>
				</Row>
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
	aliasEditorVisible: React.PropTypes.bool,
	disambiguationVisible: React.PropTypes.bool,
	languageOptions: React.PropTypes.array
};

CreatorData = connect(
	(state) => ({
		disambiguationVisible: state.get('disambiguationVisible'),
		aliasEditorVisible: state.get('aliasEditorVisible')
	})
)(CreatorData);

export default CreatorData;
