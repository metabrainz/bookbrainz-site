/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
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

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Select = require('./select2.jsx');
const _ = require('underscore');
const $ = require('jquery');

const EntitySearch = React.createClass({
	displayName: 'entitySearchInput',
	propTypes: {
		bsStyle: React.PropTypes.string,
		defaultValue: React.PropTypes.shape({
			id: React.PropTypes.string
		}),
		disabled: React.PropTypes.bool,
		groupClassName: React.PropTypes.string,
		help: React.PropTypes.string,
		label: React.PropTypes.string,
		labelClassName: React.PropTypes.string,
		onChange: React.PropTypes.func,
		options: React.PropTypes.object,
		placeholder: React.PropTypes.string,
		select2Options: React.PropTypes.object,
		standalone: React.PropTypes.bool,
		value: React.PropTypes.shape({
			id: React.PropTypes.string
		}),
		wrapperClassName: React.PropTypes.string
	},
	loadedEntities: {},
	getValue() {
		'use strict';

		const bbid = this.refs.select.getValue();
		if (bbid) {
			return this.loadedEntities[bbid];
		}

		return null;
	},
	render() {
		'use strict';

		const self = this;

		if (this.props.defaultValue) {
			this.loadedEntities[this.props.defaultValue.id] =
				this.props.defaultValue;
		}

		if (this.props.value) {
			this.loadedEntities[this.props.value.id] = this.props.value;
		}

		const select2Options = {
			minimumInputLength: 1,
			ajax: {
				url: '/search',
				data(params) {
					const queryParams = {
						q: params.term,
						page: params.page,
						mode: 'auto',
						collection: self.props.collection
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
						results: results.map((result) => ({
							id: result.bbid,
							text: result.default_alias ?
								result.default_alias.name : '(unnamed)',
							disambiguation: result.disambiguation ?
								result.disambiguation.comment : null,
							type: result._type
						}))
					};
				}
			},
			templateResult(result) {
				let template = result.text;

				const ENTITY_TYPE_ICONS = {
					Creator: 'fa-user',
					Edition: 'fa-book',
					Publication: 'fa-th-list',
					Publisher: 'fa-university',
					Work: 'fa-file-text-o'
				};

				/* eslint prefer-template: 0 */
				if (result.type) {
					template = ReactDOMServer.renderToStaticMarkup(
						<span className=
							{`fa ${ENTITY_TYPE_ICONS[result.type]}`}
						/>
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

		_.extend(select2Options, this.props.select2Options);

		const options = this.props.options || [];

		let defaultKey = null;
		if (this.props.defaultValue && this.props.defaultValue.id) {
			options.unshift(this.props.defaultValue);
			defaultKey = this.props.defaultValue.id;
		}

		let key = null;
		if (this.props.value && this.props.value.id) {
			options.unshift(this.props.value);
			key = this.props.value.id;
		}

		return (
			<Select
				bsStyle={this.props.bsStyle}
				defaultValue={defaultKey}
				disabled={this.props.disabled}
				groupClassName={this.props.groupClassName}
				help={this.props.help}
				idAttribute="id"
				label={this.props.label}
				labelAttribute="text"
				labelClassName={this.props.labelClassName}
				noDefault
				onChange={this.props.onChange}
				options={options}
				placeholder={this.props.placeholder}
				ref="select"
				select2Options={select2Options}
				standalone={this.props.standalone}
				value={key}
				wrapperClassName={this.props.wrapperClassName}
			/>
		);
	}
});

module.exports = EntitySearch;
