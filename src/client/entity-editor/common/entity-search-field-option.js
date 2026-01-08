/*
 * Copyright (C) 2015-2017  Ben Ockmore
 *               2015-2016  Sean Burke
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

import {Form, InputGroup, OverlayTrigger, Tooltip} from 'react-bootstrap';
import EntitySelect from './entity-select';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import LinkedEntitySelect from './linked-entity-select';
import PropTypes from 'prop-types';
import React from 'react';
import {RecentlyUsed} from '../../unified-form/common/recently-used';
import SelectAsync from 'react-select/async';
import ValidationLabel from '../common/validation-label';
import _ from 'lodash';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';
import {isValidBBID} from '../../../common/helpers/utils';
import makeImmutable from './make-immutable';
import request from 'superagent';

const ImmutableAsyncSelect = makeImmutable(SelectAsync);

class EntitySearchFieldOption extends React.Component {
	constructor(props) {
		super(props);
		this.selectRef = React.createRef();
		// React does not autobind non-React class methods
		this.fetchOptions = this.fetchOptions.bind(this);
		this.isArea = this.isArea.bind(this);
		this.entityToOption = this.entityToOption.bind(this);
	}

	static entityTypeMappings = {
		// Saving
		Area: 'areas',
		Author: 'authors',
		Edition: 'editions',
		EditionGroup: 'editiongroups',
		Publisher: 'publishers',
		Series: 'series',
		Work: 'works',
		// Loading
		areas: 'Area',
		authors: 'Author',
		editiongroups: 'EditionGroup',
		editions: 'Edition',
		publishers: 'Publisher',
		series: 'Series',
		works: 'Work'
	};

	/**
	 * Determines whether an entity provided to the EntitySearch component is an
	 * Area, using the present attributes.
	 *
	 * @param {Object} entity the entity to test
	 * @returns {boolean} true if the entity looks like an Area
	 */
	isArea(entity) {
		if (entity.type === 'Area') {
			return true;
		}

		return Boolean(entity.gid);
	}

	/**
	 * Takes an entity and converts it to a format acceptable to react-select.
	 *
	 * @param {Object} entity the entity to convert
	 * @returns {Object} the formatted data
	 */
	entityToOption(entity) {
		if (_.isNil(entity)) {
			return null;
		}
		const id = this.isArea(entity) ? entity.id : entity.bbid;
		const languageId = _.get(entity, ['defaultAlias', 'languageId']);
		const language = this.props.languageOptions.find(
			(index) => index.value === languageId
		);
		const entityOption = {
			...entity,
			authors: entity.authors?.join(', ') ?? null,
			disambiguation: _.get(entity, ['disambiguation', 'comment']),
			id,
			language: language && language.label,
			text: _.get(entity, ['defaultAlias', 'name']),
			type: entity.type
		};
		return entityOption;
	}

	getRecentlyUsedOptions() {
		if (!this.props.recentlyUsedEntityType) {
			return [];
		}
		const entityTypes = Array.isArray(this.props.recentlyUsedEntityType) ?
			this.props.recentlyUsedEntityType : [this.props.recentlyUsedEntityType];
		const validEntityTypes = entityTypes.filter(type =>
			type && typeof type === 'string' && type.trim().length > 0);
		if (validEntityTypes.length === 0) {
			return [];
		}
		const allRecentlyUsedItems = [];
		validEntityTypes.forEach(entityType => {
			const items = RecentlyUsed.getItems(entityType);
			if (Array.isArray(items)) {
				items.forEach(item => {
					allRecentlyUsedItems.push({
						...item,
						_sourceType: entityType
					});
				});
			}
		});
		if (allRecentlyUsedItems.length === 0) {
			return [];
		}
		const uniqueItems = _.uniqBy(allRecentlyUsedItems, 'id').slice(0, 10);
		return uniqueItems.map(item => {
			const singularType = EntitySearchFieldOption.entityTypeMappings[item._sourceType] || item._sourceType.replace(/s$/, '');
			return {
				id: item.id,
				isRecentlyUsed: true,
				text: item.name,
				type: singularType
			};
		});
	}

	getDefaultOptions() {
		const recentOptions = this.getRecentlyUsedOptions();
		if (recentOptions.length === 0) {
			return true;
		}
		return [{
			label: 'Recently Used',
			options: recentOptions
		}];
	}

	async fetchOptions(query) {
		const recentOptions = this.getRecentlyUsedOptions();
		const uniqueRecentOptions = _.uniqBy(recentOptions, 'id').slice(0, 10);
		if (!query) {
			if (uniqueRecentOptions.length === 0) {
				return [];
			}
			return [{
				label: 'Recently Used',
				options: uniqueRecentOptions
			}];
		}
		let manipulatedQuery = query;
		const bookbrainzURLRegex =
			/bookbrainz\.org\/\w+\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/gi;
		const regexpResults = bookbrainzURLRegex.exec(query);
		if (regexpResults && regexpResults.length) {
			manipulatedQuery = regexpResults[1];
		}
		if (isValidBBID(manipulatedQuery)) {
			const entity = await request.get(`/search/entity/${manipulatedQuery}`).then((res) => res.body).catch(() => null);
			if (entity && typeof this.props.onChange === 'function' && (_.snakeCase(entity.type) === this.props.type ||
				 (_.isArray(this.props.type) && this.props.type.includes(entity.type)))) {
				const entityOption = this.entityToOption(entity);
				if (entityOption.id && entityOption.text && entityOption.type) {
					const storageKey = EntitySearchFieldOption.entityTypeMappings[entityOption.type] || `${entityOption.type.toLowerCase()}s`;
					RecentlyUsed.addItem(storageKey, {
						id: entityOption.id,
						name: entityOption.text
					});
				}
				const newValue = this.props.isMulti ? [...this.props.value, entityOption] : entityOption;
				this.props.onChange(newValue);
				this.selectRef.current.blur();
				return [entityOption];
			}
		}
		const response = await request.get('/search/autocomplete').query({
			q: manipulatedQuery,
			type: this.props.type
		});
		const isSameBBIDFilter = (entity) => entity.bbid !== this.props.bbid;
		const combineFilters = (...filters) =>
			(item) =>
				filters.map((filter) => filter(item)).every((x) => x === true);
		const combinedFilters = combineFilters(
			isSameBBIDFilter,
			...this.props.filters
		);
		const filteredOptions = response.body.filter(combinedFilters);
		const searchResults = filteredOptions.map(this.entityToOption);
		if (uniqueRecentOptions.length > 0) {
			return [
				{
					label: 'Recently Used',
					options: uniqueRecentOptions
				},
				{
					label: 'Search Results',
					options: searchResults
				}
			];
		}
		return searchResults;
	}

	renderInputGroup({buttonAfter, help, wrappedSelect, ...props}) {
		if (!buttonAfter) {
			return (
				<>
					{React.cloneElement(wrappedSelect, wrappedSelect.props)}
					{help && <Form.Text muted>{help}</Form.Text>}
				</>
			);
		}

		return (
			<InputGroup>
				{React.cloneElement(wrappedSelect, wrappedSelect.props)}
				{help && <Form.Text muted>{help}</Form.Text>}
				<InputGroup.Append>{buttonAfter}</InputGroup.Append>
			</InputGroup>
		);
	}

	getOptionLabel(option) {
		return option.text;
	}

	getOptionValue(option) {
		return option.id;
	}

	render() {
		const labelElement = (
			<ValidationLabel empty={this.props.empty} error={this.props.error}>
				{this.props.label}
			</ValidationLabel>
		);
		const helpIconElement = this.props.tooltipText && (
			<OverlayTrigger
				delay={50}
				overlay={<Tooltip>{this.props.tooltipText}</Tooltip>}
			>
				<FontAwesomeIcon
					className="margin-left-0-5"
					icon={faQuestionCircle}
				/>
			</OverlayTrigger>
		);
		const SelectWrapper = this.props.SelectWrapper ?? ImmutableAsyncSelect;
		const wrappedSelect = (
			<SelectWrapper
				{...this.props}
				blurInputOnSelect
				cacheOptions
				isClearable
				className={`Select${this.props.className ? ` ${this.props.className}` : ''}`}
				classNamePrefix="react-select"
				components={{
					Option: LinkedEntitySelect,
					SingleValue: EntitySelect,
					...this.props.customComponents &&
					this.props.customComponents
				}}
				defaultOptions={this.props.recentlyUsedEntityType ? this.getDefaultOptions() : true}
				filterOptions={false}
				getOptionLabel={this.getOptionLabel}
				getOptionValue={this.getOptionValue}
				innerRef={this.selectRef}
				loadOptions={this.fetchOptions}
				onBlurResetsInput={false}
			/>
		);

		return (
			<Form.Group>
				{this.props.label && (
					<Form.Label>
						{labelElement}
						{helpIconElement}
					</Form.Label>
				)}
				{this.renderInputGroup({wrappedSelect, ...this.props})}
			</Form.Group>
		);
	}
}

EntitySearchFieldOption.displayName = 'EntitySearchFieldOption';
EntitySearchFieldOption.propTypes = {
	SelectWrapper: PropTypes.elementType,
	bbid: PropTypes.string,
	className: PropTypes.string,
	customComponents: PropTypes.object,
	empty: PropTypes.bool,
	error: PropTypes.bool,
	filters: PropTypes.array,
	isMulti: PropTypes.bool,
	label: PropTypes.string,
	languageOptions: PropTypes.array,
	onChange: PropTypes.func.isRequired,
	recentlyUsedEntityType: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.arrayOf(PropTypes.string)
	]),
	tooltipText: PropTypes.string,
	type: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.arrayOf(PropTypes.string)
	]).isRequired,
	value: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.arrayOf(PropTypes.object)
	])
};
EntitySearchFieldOption.defaultProps = {
	SelectWrapper: null,
	bbid: null,
	className: '',
	customComponents: {},
	empty: true,
	error: false,
	filters: [],
	isMulti: false,
	label: '',
	languageOptions: [],
	recentlyUsedEntityType: null,
	tooltipText: null,
	value: null
};

export default EntitySearchFieldOption;
