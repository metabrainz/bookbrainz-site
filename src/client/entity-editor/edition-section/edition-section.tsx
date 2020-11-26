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


import * as React from 'react';
import {
	Action,
	debouncedUpdateDepth,
	debouncedUpdateHeight,
	debouncedUpdatePages,
	debouncedUpdateReleaseDate,
	debouncedUpdateWeight,
	debouncedUpdateWidth,
	showPhysical,
	toggleShowEditionGroup,
	updateEditionGroup,
	updateFormat,
	updateLanguages,
	updatePublisher,
	updateStatus
} from './actions';

import {Alert, Button, Col, ListGroup, ListGroupItem, Row} from 'react-bootstrap';
import {DateObject, isNullDate} from '../../helpers/utils';
import type {List, Map} from 'immutable';
import {
	validateEditionSectionDepth,
	validateEditionSectionEditionGroup,
	validateEditionSectionHeight,
	validateEditionSectionPages,
	validateEditionSectionReleaseDate,
	validateEditionSectionWeight,
	validateEditionSectionWidth
} from '../validators/edition';
import CustomInput from '../../input';
import DateField from '../common/new-date-field';
import type {Dispatch} from 'redux';
import EntitySearchFieldOption from '../common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import LanguageField from '../common/language-field';
import LinkedEntity from '../common/linked-entity';
import NumericField from '../common/numeric-field';
import Select from 'react-select';
import _ from 'lodash';
import {connect} from 'react-redux';
import {entityToOption} from '../../../server/helpers/utils';
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

type OptionalNumber = number | null | undefined;
type OptionalBool = boolean| null | undefined;
type StateProps = {
	depthValue: OptionalNumber,
	formatValue: OptionalNumber,
	heightValue: OptionalNumber,
	languageValues: List<LanguageOption>,
	pagesValue: OptionalNumber,
	physicalVisible: OptionalBool,
	publisherValue: Map<string, any>,
	editionGroupRequired: OptionalBool,
	editionGroupVisible: OptionalBool,
	editionGroupValue: Map<string, any>,
	matchingNameEditionGroups: any[] | null | undefined,
	releaseDateValue: DateObject | null | undefined,
	statusValue: OptionalNumber,
	weightValue: OptionalNumber,
	widthValue: OptionalNumber
};

type DispatchProps = {
	onDepthChange: (arg: React.ChangeEvent<HTMLInputElement>) => unknown,
	onFormatChange: (obj: {value: number} | null | undefined) => unknown,
	onHeightChange: (arg: React.ChangeEvent<HTMLInputElement>) => unknown,
	onLanguagesChange: (arg: Array<LanguageOption>) => unknown,
	onPagesChange: (arg: React.ChangeEvent<HTMLInputElement>) => unknown,
	onPhysicalButtonClick: () => unknown,
	onPublisherChange: (arg: Publisher) => unknown,
	onToggleShowEditionGroupSection: (showEGSection: boolean) => unknown,
	onEditionGroupChange: (arg: EditionGroup) => unknown,
	onReleaseDateChange: (arg: string) => unknown,
	onStatusChange: (obj: {value: number} | null | undefined) => unknown,
	onWeightChange: (arg: React.ChangeEvent<HTMLInputElement>) => unknown,
	onWidthChange: (arg: React.ChangeEvent<HTMLInputElement>) => unknown
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
	onToggleShowEditionGroupSection,
	onEditionGroupChange,
	onPublisherChange,
	onStatusChange,
	onWeightChange,
	onWidthChange,
	pagesValue,
	physicalVisible,
	editionGroupRequired,
	editionGroupValue,
	editionGroupVisible,
	matchingNameEditionGroups,
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

	const {isValid: isValidReleaseDate, errorMessage: dateErrorMessage} = validateEditionSectionReleaseDate(releaseDateValue);

	const hasmatchingNameEditionGroups = Array.isArray(matchingNameEditionGroups) && matchingNameEditionGroups.length > 0;

	const showAutoCreateEditionGroupMessage =
		!editionGroupValue &&
		!editionGroupVisible &&
		!editionGroupRequired;

	const showMatchingEditionGroups = hasmatchingNameEditionGroups && !editionGroupValue;

	const getEditionGroupSearchSelect = () => (
		<React.Fragment>
			<Col className="margin-bottom-2" md={6} mdOffset={showMatchingEditionGroups ? 0 : 3}>
				<EntitySearchFieldOption
					clearable={false}
					error={!validateEditionSectionEditionGroup(editionGroupValue, true)}
					help="Group with other Editions of the same book"
					instanceId="edition-group"
					label="Edition Group"
					tooltipText="Group together different Editions of the same book.
					<br>For example paperback, hardcover and e-book editions."
					type="edition-group"
					value={editionGroupValue}
					onChange={onEditionGroupChange}
				/>
				<Button
					block
					bsStyle="primary"
					className="wrap"
					// eslint-disable-next-line react/jsx-no-bind
					onClick={onToggleShowEditionGroupSection.bind(this, false)}
				>
					<FontAwesomeIcon icon="clone"/>&nbsp;Automatically create an Edition Group
				</Button>
			</Col>
		</React.Fragment>
	);

	return (
		<form>
			<h2>
				What else do you know about the Edition?
			</h2>
			<p className="text-muted">
				Edition Group is required — this cannot be blank. You can search for and choose an existing Edition Group,
				or choose to automatically create one instead.
			</p>
			<Row className="margin-bottom-3">
				{
					showAutoCreateEditionGroupMessage ?
						<Col md={6} mdOffset={showMatchingEditionGroups ? 0 : 3}>
							<Alert bsStyle="success">
								<p>A new Edition Group with the same name will be created automatically.</p>
								<br/>
								<Button
									block
									bsStyle="success"
									className="wrap"
									// eslint-disable-next-line react/jsx-no-bind
									onClick={onToggleShowEditionGroupSection.bind(this, true)}
								>
									<FontAwesomeIcon icon="search"/>&nbsp;Search for an existing Edition Group
								</Button>
							</Alert>
						</Col> :
						getEditionGroupSearchSelect()
				}
				{showMatchingEditionGroups &&
					<Col md={6}>
						<Alert bsStyle="warning">
							{matchingNameEditionGroups.length > 1 ?
								'Edition Groups with the same name as this Edition already exist' :
								'An existing Edition Group with the same name as this Edition already exists'
							}
							<br/>
							Please review the Edition Groups below and select the one that corresponds to your Edition.
							<br/>
							<small>
								If no Edition Group is selected, a new one will be created automatically.
								<br/>
								Click on the <FontAwesomeIcon icon="external-link-alt"/> icon open in a new tab, and click an item to select.
							</small>
							<ListGroup className="margin-top-1">
								{matchingNameEditionGroups.map(eg => (
									<ListGroupItem key={eg.bbid}>
										<LinkedEntity option={entityToOption(eg)} onSelect={onEditionGroupChange}/>
									</ListGroupItem>
								))}
							</ListGroup>
						</Alert>
					</Col>
				}
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
						empty={isNullDate(releaseDateValue)}
						error={!isValidReleaseDate}
						errorMessage={dateErrorMessage}
						label="Release Date"
						placeholder="YYYY-MM-DD"
						tooltipText="The date this specific edition was published (not the first publication date of the work). If unsure, leave empty."
						onChangeDate={onReleaseDateChange}
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
	const matchingNameEditionGroups = state.get('matchingNameEditionGroups');

	return {
		depthValue: state.get('depth'),
		editionGroupRequired: state.get('editionGroupRequired'),
		editionGroupValue: state.get('editionGroup'),
		editionGroupVisible: state.get('editionGroupVisible'),
		formatValue: state.get('format'),
		heightValue: state.get('height'),
		languageValues: state.get('languages'),
		matchingNameEditionGroups,
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
		onEditionGroupChange: (value) => dispatch(updateEditionGroup(value)),
		onFormatChange: (value: {value: number} | null) =>
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
		onReleaseDateChange: (releaseDate) =>
			dispatch(debouncedUpdateReleaseDate(releaseDate)),
		onStatusChange: (value: {value: number} | null) =>
			dispatch(updateStatus(value && value.value)),
		onToggleShowEditionGroupSection: (showEGSection: boolean) => {
			if (showEGSection === false) {
				dispatch(updateEditionGroup(null));
			}
			return dispatch(toggleShowEditionGroup(showEGSection));
		},
		onWeightChange: (event) => dispatch(debouncedUpdateWeight(
			event.target.value ? parseInt(event.target.value, 10) : null
		)),
		onWidthChange: (event) => dispatch(debouncedUpdateWidth(
			event.target.value ? parseInt(event.target.value, 10) : null
		))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(EditionSection);
