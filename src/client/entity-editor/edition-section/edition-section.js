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

// @flow

import {
	type Action,
	debouncedUpdateDepth,
	debouncedUpdateHeight,
	debouncedUpdatePages,
	debouncedUpdateReleaseDate,
	debouncedUpdateWeight,
	debouncedUpdateWidth,
	showEditionGroup,
	showPhysical,
	updateEditionGroup,
	updateFormat,
	updateLanguages,
	updatePublisher,
	updateStatus
} from './actions';
import {Button, Col, Row} from 'react-bootstrap';
import type {List, Map} from 'immutable';
import {
	validateEditionSectionDepth,
	validateEditionSectionHeight,
	validateEditionSectionPages,
	validateEditionSectionReleaseDate,
	validateEditionSectionWeight,
	validateEditionSectionWidth
} from '../validators/edition';

import CustomInput from '../../input';
import DateField from '../common/date-field';
import EntitySearchFieldOption from '../common/entity-search-field-option';
import LanguageField from '../common/language-field';
import NumericField from '../common/numeric-field';
import React from 'react';
import Select from 'react-select';
import _ from 'lodash';
import {connect} from 'react-redux';
import makeImmutable from '../common/make-immutable';


const ImmutableLanguageField = makeImmutable(LanguageField);

type EditionFormat = {
	label: string,
	id: number
};

type EditionStatus = {
	label: string,
	id: number
};

type LanguageOption = {
	name: string,
	id: number
};

type Publisher = {
	value: string,
	id: number
};

type EditionGroup = {
	value: string,
	id: number
};

type OwnProps = {
	languageOptions: Array<LanguageOption>,
	editionFormats: Array<EditionFormat>,
	editionStatuses: Array<EditionStatus>
};

type StateProps = {
	depthValue: ?number,
	formatValue: ?number,
	heightValue: ?number,
	languageValues: List<LanguageOption>,
	pagesValue: ?number,
	physicalVisible: ?boolean,
	publisherValue: Map<string, any>,
	editionGroupVisible: ?boolean,
	editionGroupValue: Map<string, any>,
	releaseDateValue: ?string,
	statusValue: ?number,
	weightValue: ?number,
	widthValue: ?number
};

type DispatchProps = {
	onDepthChange: (SyntheticInputEvent<>) => mixed,
	onFormatChange: (?{value: number}) => mixed,
	onHeightChange: (SyntheticInputEvent<>) => mixed,
	onLanguagesChange: (Array<LanguageOption>) => mixed,
	onPagesChange: (SyntheticInputEvent<>) => mixed,
	onPhysicalButtonClick: () => mixed,
	onPublisherChange: (Publisher) => mixed,
	onEditionGroupButtonClick: () => mixed,
	onEditionGroupChange: (EditionGroup) => mixed,
	onReleaseDateChange: (SyntheticInputEvent<>) => mixed,
	onStatusChange: (?{value: number}) => mixed,
	onWeightChange: (SyntheticInputEvent<>) => mixed,
	onWidthChange: (SyntheticInputEvent<>) => mixed
};

type Props = OwnProps & StateProps & DispatchProps;

/**
 * Container component. The EditionSection component contains input fields
 * specific to the edition entity. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.editionFormats - The list of possible formats for a
 *                edition.
 * @param {Array} props.editionStatuses - The list of possible statuses for a
 *                edition.
 * @param {number} props.formatValue - The ID of the format currently selected
 *        for the edition.
 * @param {number} props.statusValue - The ID of the status currently selected
 *        for the edition.
 * @param {Function} props.onFormatChange - A function to be called when
 *        a different edition format is selected.
 * @param {Function} props.onStatusChange - A function to be called when
 *        a different edition status is selected.
 * @returns {ReactElement} React element containing the rendered EditionSection.
 */
function EditionSection({
	depthValue,
	editionFormats,
	editionStatuses,
	formatValue,
	heightValue,
	languageOptions,
	languageValues,
	onLanguagesChange,
	onDepthChange,
	onFormatChange,
	onHeightChange,
	onPhysicalButtonClick,
	onReleaseDateChange,
	onPagesChange,
	onEditionGroupButtonClick,
	onEditionGroupChange,
	onPublisherChange,
	onStatusChange,
	onWeightChange,
	onWidthChange,
	pagesValue,
	physicalVisible,
	editionGroupValue,
	editionGroupVisible,
	publisherValue,
	releaseDateValue,
	statusValue,
	weightValue,
	widthValue
}: Props) {
	const languageOptionsForDisplay = languageOptions.map((language) => ({
		label: language.name,
		value: language.id
	}));

	const editionFormatsForDisplay = editionFormats.map((format) => ({
		label: format.label,
		value: format.id
	}));

	const editionStatusesForDisplay = editionStatuses.map((status) => ({
		label: status.label,
		value: status.id
	}));

	return (
		<form>
			<h2>
				What else do you know about the Edition?
			</h2>
			<p className="text-muted">
				Edition Group is required — this cannot be blank. <a href="/edition-group/create" target="_blank">Click here</a> to create one if you did not find an existing one.
			</p>
			<Row>
				<Col md={6} mdOffset={3}>
					<EntitySearchFieldOption
						help="Group with other Editions by the same publisher"
						instanceId="edition-group"
						label="Edition Group"
						tooltipText="Group together Editions with no substantial textual or editorial changes.
						<br>For example, identical paperback, hardcover and e-book editions."
						type="edition-group"
						value={editionGroupValue}
						onChange={onEditionGroupChange}
					/>
				</Col>
			</Row>
			<p className="text-muted">
				Below fields are optional — leave something blank if you
				don&rsquo;t know it
			</p>
			<Row>
				<Col md={6} mdOffset={3}>
					<EntitySearchFieldOption
						instanceId="publisher"
						label="Publisher"
						type="publisher"
						value={publisherValue}
						onChange={onPublisherChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<DateField
						show
						defaultValue={releaseDateValue}
						empty={!releaseDateValue}
						error={
							!validateEditionSectionReleaseDate(releaseDateValue)
						}
						label="Release Date"
						placeholder="YYYY-MM-DD"
						onChange={onReleaseDateChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<ImmutableLanguageField
						empty
						multi
						instanceId="language"
						options={languageOptionsForDisplay}
						tooltipText="Main language used for the content of the edition"
						value={languageValues}
						onChange={onLanguagesChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col md={3} mdOffset={3}>
					<CustomInput label="Format" tooltipText="The type of printing and binding of the edition, or digital equivalent">
						<Select
							instanceId="editionFormat"
							options={editionFormatsForDisplay}
							value={formatValue}
							onChange={onFormatChange}
						/>
					</CustomInput>
				</Col>
				<Col md={3}>
					<CustomInput label="Status" tooltipText="Has the work been published, or is it in a draft stage?">
						<Select
							instanceId="editionStatus"
							options={editionStatusesForDisplay}
							value={statusValue}
							onChange={onStatusChange}
						/>
					</CustomInput>
				</Col>
			</Row>

			{
				!editionGroupVisible &&
				<Row>
					<Col md={6} mdOffset={3}>
						<Button
							bsStyle="link"
							className="text-center"
							onClick={onEditionGroupButtonClick}
						>
							Group with other existing formats…
						</Button>
					</Col>
				</Row>
			}

			{
				physicalVisible &&
				<Row>
					<Col md={3} mdOffset={3}>
						<NumericField
							addonAfter="mm"
							defaultValue={widthValue}
							empty={_.isNil(widthValue)}
							error={!validateEditionSectionWidth(widthValue)}
							label="Width"
							onChange={onWidthChange}
						/>
						<NumericField
							addonAfter="mm"
							defaultValue={heightValue}
							empty={_.isNil(heightValue)}
							error={!validateEditionSectionHeight(heightValue)}
							label="Height"
							onChange={onHeightChange}
						/>
						<NumericField
							addonAfter="mm"
							defaultValue={depthValue}
							empty={_.isNil(depthValue)}
							error={!validateEditionSectionDepth(depthValue)}
							label="Depth"
							onChange={onDepthChange}
						/>
					</Col>
					<Col md={3}>
						<NumericField
							addonAfter="g"
							defaultValue={weightValue}
							empty={_.isNil(weightValue)}
							error={!validateEditionSectionWeight(weightValue)}
							label="Weight"
							onChange={onWeightChange}
						/>
						<NumericField
							addonAfter="pages"
							defaultValue={pagesValue}
							empty={_.isNil(pagesValue)}
							error={!validateEditionSectionPages(pagesValue)}
							label="Page Count"
							onChange={onPagesChange}
						/>
					</Col>
				</Row>
			}
			{
				!physicalVisible &&
				<Row>
					<Col className="text-center" md={4} mdOffset={4}>
						<Button
							bsStyle="link"
							onClick={onPhysicalButtonClick}
						>
							Add physical data…
						</Button>
					</Col>
				</Row>
			}
		</form>
	);
}
EditionSection.displayName = 'EditionSection';

type RootState = Map<string, Map<string, any>>;
function mapStateToProps(rootState: RootState): StateProps {
	const state: Map<string, any> = rootState.get('editionSection');

	return {
		depthValue: state.get('depth'),
		editionGroupValue: state.get('editionGroup'),
		editionGroupVisible: state.get('editionGroupVisible'),
		formatValue: state.get('format'),
		heightValue: state.get('height'),
		languageValues: state.get('languages'),
		pagesValue: state.get('pages'),
		physicalVisible: state.get('physicalVisible'),
		publisherValue: state.get('publisher'),
		releaseDateValue: state.get('releaseDate'),
		statusValue: state.get('status'),
		weightValue: state.get('weight'),
		widthValue: state.get('width')
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onDepthChange: (event) => dispatch(debouncedUpdateDepth(
			event.target.value ? parseInt(event.target.value, 10) : null
		)),
		onEditionGroupButtonClick: () => dispatch(showEditionGroup()),
		onEditionGroupChange: (value) => dispatch(updateEditionGroup(value)),
		onFormatChange: (value: ?{value: number}) =>
			dispatch(updateFormat(value && value.value)),
		onHeightChange: (event) => dispatch(debouncedUpdateHeight(
			event.target.value ? parseInt(event.target.value, 10) : null
		)),
		onLanguagesChange: (values: Array<LanguageOption>) =>
			dispatch(updateLanguages(values)),
		onPagesChange: (event) => dispatch(debouncedUpdatePages(
			event.target.value ? parseInt(event.target.value, 10) : null
		)),
		onPhysicalButtonClick: () => dispatch(showPhysical()),
		onPublisherChange: (value) => dispatch(updatePublisher(value)),
		onReleaseDateChange: (momentDate) =>
			dispatch(debouncedUpdateReleaseDate(momentDate.format('YYYY-MM-DD'))),
		onStatusChange: (value: ?{value: number}) =>
			dispatch(updateStatus(value && value.value)),
		onWeightChange: (event) => dispatch(debouncedUpdateWeight(
			event.target.value ? parseInt(event.target.value, 10) : null
		)),
		onWidthChange: (event) => dispatch(debouncedUpdateWidth(
			event.target.value ? parseInt(event.target.value, 10) : null
		))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(EditionSection);
