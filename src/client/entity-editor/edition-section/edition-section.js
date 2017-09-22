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
	type Action, debouncedUpdateDepth, debouncedUpdateHeight,
	debouncedUpdatePages, debouncedUpdateReleaseDate,
	debouncedUpdateWeight, debouncedUpdateWidth,
	showPhysical, updateFormat, updateLanguages,
	updatePublication, updatePublisher, updateStatus
} from './actions';
import {Button, Col, Input, Row} from 'react-bootstrap';
import type {List, Map} from 'immutable';
import DateField from '../common/date-field';
import {type Dispatch} from 'redux';
import EntitySearchField from './entity-search-field';
import LanguageField from '../common/language-field';
import React from 'react';
import Select from 'react-select';
import {connect} from 'react-redux';


function isPartialDateValid(value: ?string): boolean {
	const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;
	const ymRegex = /^\d{4}-\d{2}$/;
	const yRegex = /^\d{4}$/;

	if (!value) {
		return true;
	}

	const validSyntax = Boolean(
		ymdRegex.test(value) ||
		ymRegex.test(value) ||
		yRegex.test(value)
	);
	const validValue = !isNaN(Date.parse(value));

	return validSyntax && validValue;
}

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

type Publication = {
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
	publicationValue: Map<string, any>,
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
	onPublicationChange: (Publication) => mixed,
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
	onPublicationChange,
	onPublisherChange,
	onStatusChange,
	onWeightChange,
	onWidthChange,
	pagesValue,
	physicalVisible,
	publicationValue,
	publisherValue,
	releaseDateValue,
	statusValue,
	weightValue,
	widthValue
	}: Props
) {
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
				Publication is required — this cannot be blank
			</p>
			<Row>
				<Col md={6} mdOffset={3}>
					<EntitySearchField
						label="Publication"
						type="publication"
						value={publicationValue && publicationValue.toJS()}
						onChange={onPublicationChange}
					/>
				</Col>
			</Row>
			<p className="text-muted">
				Below fields are optional — leave something blank if you
				don&rsquo;t know it
			</p>
			<Row>
				<Col md={6} mdOffset={3}>
					<EntitySearchField
						label="Publisher"
						type="publisher"
						value={publisherValue && publisherValue.toJS()}
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
						error={!isPartialDateValid(releaseDateValue)}
						label="Release Date"
						placeholder="YYYY-MM-DD"
						onChange={onReleaseDateChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<LanguageField
						multi
						options={languageOptionsForDisplay}
						value={languageValues.toJS()}
						onChange={onLanguagesChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col md={3} mdOffset={3}>
					<Input label="Format">
						<Select
							options={editionFormatsForDisplay}
							value={formatValue}
							onChange={onFormatChange}
						/>
					</Input>
				</Col>
				<Col md={3}>
					<Input label="Status">
						<Select
							options={editionStatusesForDisplay}
							value={statusValue}
							onChange={onStatusChange}
						/>
					</Input>
				</Col>
			</Row>
			{
				physicalVisible &&
				<Row>
					<Col md={3} mdOffset={3}>
						<Input
							addonAfter="mm"
							defaultValue={widthValue}
							label="Width"
							type="number"
							onChange={onWidthChange}
						/>
						<Input
							addonAfter="mm"
							defaultValue={heightValue}
							label="Height"
							type="number"
							onChange={onHeightChange}
						/>
						<Input
							addonAfter="mm"
							defaultValue={depthValue}
							label="Depth"
							type="number"
							onChange={onDepthChange}
						/>
					</Col>
					<Col md={3}>
						<Input
							addonAfter="g"
							defaultValue={weightValue}
							label="Weight"
							type="number"
							onChange={onWeightChange}
						/>
						<Input
							addonAfter="pages"
							defaultValue={pagesValue}
							label="Page Count"
							type="number"
							onChange={onPagesChange}
						/>
					</Col>
				</Row>
			}
			<Row>
				<Col className="text-center" md={4} mdOffset={4}>
					<Button
						bsStyle="link"
						disabled={physicalVisible}
						onClick={onPhysicalButtonClick}
					>
						Add physical data…
					</Button>
				</Col>
			</Row>
		</form>
	);
}
EditionSection.displayName = 'EditionSection';

type RootState = Map<string, Map<string, any>>;
function mapStateToProps(rootState: RootState): StateProps {
	const state: Map<string, any> = rootState.get('editionSection');

	return {
		depthValue: state.get('depth'),
		formatValue: state.get('format'),
		heightValue: state.get('height'),
		languageValues: state.get('languages'),
		pagesValue: state.get('pages'),
		physicalVisible: state.get('physicalVisible'),
		publicationValue: state.get('publication'),
		publisherValue: state.get('publisher'),
		releaseDateValue: state.get('releaseDate'),
		statusValue: state.get('status'),
		weightValue: state.get('weight'),
		widthValue: state.get('width')
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onDepthChange: (event) => dispatch(
			debouncedUpdateDepth(parseInt(event.target.value, 10))
		),
		onFormatChange: (value: ?{value: number}) =>
			dispatch(updateFormat(value && value.value)),
		onHeightChange: (event) => dispatch(
			debouncedUpdateHeight(parseInt(event.target.value, 10))
		),
		onLanguagesChange: (values: Array<LanguageOption>) =>
			dispatch(updateLanguages(values)),
		onPagesChange: (event) => dispatch(
			debouncedUpdatePages(parseInt(event.target.value, 10))
		),
		onPhysicalButtonClick: () => dispatch(showPhysical()),
		onPublicationChange: (value) => dispatch(updatePublication(value)),
		onPublisherChange: (value) => dispatch(updatePublisher(value)),
		onReleaseDateChange: (event) =>
			dispatch(debouncedUpdateReleaseDate(event.target.value)),
		onStatusChange: (value: ?{value: number}) =>
			dispatch(updateStatus(value && value.value)),
		onWeightChange: (event) => dispatch(
			debouncedUpdateWeight(parseInt(event.target.value, 10))
		),
		onWidthChange: (event) => dispatch(
			debouncedUpdateWidth(parseInt(event.target.value, 10))
		)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(EditionSection);
