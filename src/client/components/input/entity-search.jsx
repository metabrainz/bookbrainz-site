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
const Select = require('./select2.jsx');
const _ = require('underscore');
const $ = require('jquery');

const EntitySearch = React.createClass({
	displayName: 'entitySearchInput',
	getValue() {
		'use strict';

		return this.refs.select.getValue();
	},
	render() {
		'use strict';

		const self = this;

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
					const data = {
						results: []
					};

					if (results.error) {
						data.results.push({
							id: null,
							text: results.error
						});

						return data;
					}

					results.forEach((result) => {
						data.results.push({
							id: result.bbid,
							text: result.default_alias ?
								result.default_alias.name : '(unnamed)',
							disambiguation: result.disambiguation ?
								result.disambiguation.comment : null,
							type: result._type
						});
					});

					return data;
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
					template = React.renderToStaticMarkup(
						<span className={'fa ' + ENTITY_TYPE_ICONS[result.type]}/>
					) + ' ' + template;
				}

				if (result.disambiguation) {
					template += React.renderToStaticMarkup(
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
				value={this.props.value}
				wrapperClassName={this.props.wrapperClassName}
			/>
		);
	}
});

module.exports = EntitySearch;
