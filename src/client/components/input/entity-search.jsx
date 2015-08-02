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

var React = require('react');
var Select = require('./select2.jsx');
var _ = require('underscore');
var $ = require('jquery');

var EntitySearch = React.createClass({
	getValue: function() {
		'use strict';

		return this.refs.select.getValue();
	},
	render: function() {
		'use strict';

		var self = this;

		var select2Options = {
			minimumInputLength: 1,
			ajax: {
				url: '/search',
				data: function(params) {
					var queryParams = {
						q: params.term,
						page: params.page,
						mode: 'auto',
						collection: self.props.collection
					};

					return queryParams;
				},
				processResults: function(results) {
					var data = {
						results: []
					};

					if (results.error) {
						data.results.push({
							id: null,
							text: results.error
						});

						return data;
					}

					results.forEach(function(result) {
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
			templateResult: function(result) {
				var template = result.text;

				var ENTITY_TYPE_ICONS = {
					'Creator': 'fa-user',
					'Edition': 'fa-book',
					'Publication': 'fa-th-list',
					'Publisher': 'fa-university',
					'Work': 'fa-file-text-o'
				};

				if (result.type) {
					template = React.renderToStaticMarkup(
						<span className={'fa ' + ENTITY_TYPE_ICONS[result.type]}/>
					) + ' ' + template;
				}

				if (result.disambiguation) {
					template += React.renderToStaticMarkup(
						<span
							className='disambig'>
							({result.disambiguation})
						</span>
					);
				}

				return $.parseHTML(template);
			}
		};

		_.extend(select2Options, this.props.select2Options);

		var options = this.props.options || [];

		var defaultKey = null;
		if (this.props.defaultValue && this.props.defaultValue.id) {
			options.unshift(this.props.defaultValue);
			defaultKey = this.props.defaultValue.id;
		}

		return (
			<Select
				placeholder={this.props.placeholder}
				value={this.props.value}
				defaultValue={defaultKey}
				label={this.props.label}
				idAttribute='id'
				labelAttribute='text'
				help={this.props.help}
				bsStyle={this.props.bsStyle}
				disabled={this.props.disabled}
				ref='select'
				groupClassName={this.props.groupClassName}
				wrapperClassName={this.props.wrapperClassName}
				labelClassName={this.props.labelClassName}
				noDefault
				onChange={this.props.onChange}
				select2Options={select2Options}
				options={options}
				standalone={this.props.standalone} />
		);
	}
});

module.exports = EntitySearch;
