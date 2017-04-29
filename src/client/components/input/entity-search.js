/*
 * Copyright (C) 2015       Ben Ockmore
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

import $ from 'jquery';
import Icon from 'react-fontawesome';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Select from './select2';
import _assign from 'lodash.assign';

class EntitySearch extends React.Component {
	constructor(props) {
		super(props);

		this.loadedEntities = {};
	}

	getValue() {
		const bbid = this.select.getValue();

		if (bbid) {
			return this.loadedEntities[bbid];
		}

		return null;
	}

	render() {
		const self = this;

		if (this.props.defaultValue) {
			this.loadedEntities[this.props.defaultValue.bbid] =
				this.props.defaultValue;
		}

		if (this.props.value) {
			this.loadedEntities[this.props.value.bbid] = this.props.value;
		}

		function entityToOption(entity) {
			return {
				disambiguation: entity.disambiguation ?
					entity.disambiguation.comment : null,
				id: entity.bbid,
				text: entity.defaultAlias ?
					entity.defaultAlias.name : '(unnamed)',
				type: entity.type
			};
		}

		const select2Options = {
			ajax: {
				data(params) {
					const queryParams = {
						collection: self.props.collection,
						page: params.page,
						q: params.term
					};

					return queryParams;
				},
				processResults(results) {
					if (results.error) {
						return {
							results: [{
								id: null,
								text: results.error
							}]
						};
					}

					results.forEach((result) => {
						self.loadedEntities[result.bbid] = result;
					});

					return {
						results: results.map(entityToOption)
					};
				},
				url: '/search/autocomplete'
			},
			minimumInputLength: 1,
			templateResult(result) {
				let template = result.text;

				const ENTITY_TYPE_ICONS = {
					Area: 'globe',
					Creator: 'user',
					Edition: 'book',
					Publication: 'th-list',
					Publisher: 'university',
					Work: 'file-text-o'
				};

				/* eslint prefer-template: 0 */
				if (result.type) {
					template = ReactDOMServer.renderToStaticMarkup(
						<Icon name={ENTITY_TYPE_ICONS[result.type]}/>
					) + ` ${template}`;
				}

				if (result.disambiguation) {
					template += ReactDOMServer.renderToStaticMarkup(
						<span className="disambig">
							({result.disambiguation})
						</span>
					);
				}

				return $.parseHTML(template);
			}
		};

		_assign(select2Options, this.props.select2Options);

		const options = this.props.options || [];

		function keyFromValue(value) {
			let key = null;

			if (value && value.bbid) {
				options.unshift(entityToOption(value));
				key = value.bbid;
			}

			return key;
		}

		const defaultKey = keyFromValue(this.props.defaultValue);
		const key = keyFromValue(this.props.value);

		return (
			<Select
				dynamicOptions
				noDefault
				bsStyle={this.props.bsStyle}
				defaultValue={defaultKey}
				disabled={this.props.disabled}
				groupClassName={this.props.groupClassName}
				help={this.props.help}
				idAttribute="id"
				label={this.props.label}
				labelAttribute="text"
				labelClassName={this.props.labelClassName}
				options={options}
				placeholder={this.props.placeholder}
				ref={(ref) => this.select = ref}
				select2Options={select2Options}
				standalone={this.props.standalone}
				value={key}
				wrapperClassName={this.props.wrapperClassName}
				onChange={this.props.onChange}
			/>
		);
	}
}

// TODO: pass props to underlying Select using spread syntax
EntitySearch.displayName = 'EntitySearch';
EntitySearch.propTypes = {
	bsStyle: React.PropTypes.string,
	collection: React.PropTypes.string,
	defaultValue: React.PropTypes.shape({
		bbid: React.PropTypes.string
	}),
	disabled: React.PropTypes.bool,
	groupClassName: React.PropTypes.string,
	help: React.PropTypes.string,
	label: React.PropTypes.string,
	labelClassName: React.PropTypes.string,
	onChange: React.PropTypes.func,
	options: React.PropTypes.array.isRequired,
	placeholder: React.PropTypes.string,
	select2Options: React.PropTypes.object,
	standalone: React.PropTypes.bool,
	value: React.PropTypes.shape({
		bbid: React.PropTypes.string
	}),
	wrapperClassName: React.PropTypes.string
};
EntitySearch.defaultProps = {
	bsStyle: null,
	collection: null,
	defaultValue: null,
	disabled: null,
	groupClassName: null,
	help: null,
	label: null,
	labelClassName: null,
	onChange: null,
	placeholder: null,
	select2Options: {},
	standalone: null,
	value: null,
	wrapperClassName: null
};

export default EntitySearch;
