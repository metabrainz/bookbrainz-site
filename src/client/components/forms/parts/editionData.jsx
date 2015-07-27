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
var PartialDate = require('../../input/partialDate.jsx');
var Select = require('../../input/select.jsx');
var SearchSelect = require('../../input/search-select.jsx');
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Identifiers = require('./identifiers.jsx');


var EditionData = React.createClass({
	getValue: function() {
		'use strict';

		return {
			publication: this.refs.publication.getValue(),
			publisher: this.refs.publisher.getValue() === '' ? null : this.refs.publisher.getValue(),
			releaseDate: this.refs.release.getValue(),
			language: this.refs.language.getValue(),
			editionFormat: this.refs.editionFormat.getValue(),
			editionStatus: this.refs.editionStatus.getValue(),
			disambiguation: this.refs.disambiguation.getValue(),
			annotation: this.refs.annotation.getValue(),
			identifiers: this.refs.identifiers.getValue(),
			pages: this.refs.pages.getValue(),
			width: this.refs.width.getValue(),
			height: this.refs.height.getValue(),
			depth: this.refs.depth.getValue(),
			weight: this.refs.weight.getValue()
		};
	},
	valid: function() {
		'use strict';

		return this.refs.release.valid() && this.refs.publication.getValue().length;
	},
	render: function() {
		'use strict';

		var initialPublication = null;
		var initialPublisher = null;
		var initialReleaseDate = null;
		var initialLanguage = null;
		var initialEditionFormat = null;
		var initialEditionStatus = null;
		var initialDisambiguation = null;
		var initialAnnotation = null;
		var initialIdentifiers = [];
		var initialPages = null;
		var initialWidth = null;
		var initialHeight = null;
		var initialDepth = null;
		var initialWeight = null;
		if (this.props.edition) {
			if (this.props.edition.publication) {
				initialPublication = {
					id: this.props.edition.publication.bbid,
					text: this.props.edition.publication.default_alias ? this.props.edition.publication.default_alias.name : null
				};
			}

			if (this.props.edition.publisher) {
				initialPublisher = {
					id: this.props.edition.publisher.bbid,
					text: this.props.edition.publisher.default_alias ? this.props.edition.publisher.default_alias.name : null
				};
			}

			initialReleaseDate = this.props.edition.release_date;
			initialLanguage = this.props.edition.language ? this.props.edition.language.language_id : null;
			initialEditionFormat = this.props.edition.edition_format ? this.props.edition.edition_format.edition_format_id : null;
			initialEditionStatus = this.props.edition.edition_status ? this.props.edition.edition_status.edition_status_id : null;
			initialDisambiguation = this.props.edition.disambiguation ? this.props.edition.disambiguation.comment : null;
			initialAnnotation = this.props.edition.annotation ? this.props.edition.annotation.content : null;
			initialPages = (this.props.edition.pages || this.props.edition.pages === 0) ? this.props.edition.pages : null;
			initialWidth = (this.props.edition.width || this.props.edition.width === 0) ? this.props.edition.width : null;
			initialHeight = (this.props.edition.height || this.props.edition.height === 0) ? this.props.edition.height : null;
			initialDepth = (this.props.edition.depth || this.props.edition.depth === 0) ? this.props.edition.depth : null;
			initialWeight = (this.props.edition.weight || this.props.edition.weight === 0) ? this.props.edition.weight : null;
			initialIdentifiers = this.props.edition.identifiers.map(function(identifier) {
				return {
					id: identifier.id,
					value: identifier.value,
					type: identifier.identifier_type.identifier_type_id
				};
			});
		}

		var select2Options = {
			width: '100%'
		};

		return (
			<div className={(this.props.visible === false) ? 'hidden' : ''}>
				<h2>Add Data</h2>
				<p className='lead'>Fill out any data you know about the entity.</p>

				<div className='form-horizontal'>
					<SearchSelect
						label='Publication'
						labelAttribute='name'
						ref='publication'
						defaultValue={initialPublication}
						collection='publication'
						placeholder='Select publication…'
						select2Options={select2Options}
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<SearchSelect
						label='Publisher'
						labelAttribute='name'
						ref='publisher'
						defaultValue={initialPublisher}
						collection='publisher'
						placeholder='Select publisher…'
						select2Options={select2Options}
						labelClassName='col-md-4'
						wrapperClassName='col-md-4'
						nodefault />
					<PartialDate
						label='Release Date'
						ref='release'
						defaultValue={initialReleaseDate}
						placeholder='YYYY-MM-DD'
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<Select
						label='Language'
						labelAttribute='name'
						idAttribute='id'
						defaultValue={initialLanguage}
						ref='language'
						placeholder='Select edition language…'
						noDefault
						options={this.props.languages}
						select2Options={select2Options}
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<Select
						label='Format'
						labelAttribute='label'
						idAttribute='id'
						defaultValue={initialEditionFormat}
						ref='editionFormat'
						placeholder='Select edition format…'
						noDefault
						options={this.props.editionFormats}
						select2Options={select2Options}
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<Select
						label='Status'
						labelAttribute='label'
						idAttribute='id'
						defaultValue={initialEditionStatus}
						ref='editionStatus'
						placeholder='Select edition status…'
						noDefault
						options={this.props.editionStatuses}
						select2Options={select2Options}
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<hr/>
					<div className='row'>
						<div className='col-md-11 col-md-offset-1'>
							<div className='col-md-3'>
								<Input
									type='text'
									label='Page Count'
									ref='pages'
									defaultValue={initialPages}
									labelClassName='col-md-7'
									wrapperClassName='col-md-5' />
							</div>
							<div className='col-md-3'>
								<Input
									type='text'
									label='Weight (g)'
									ref='weight'
									defaultValue={initialWeight}
									labelClassName='col-md-7'
									wrapperClassName='col-md-5' />
							</div>
						</div>
					</div>
					<div className='row'>
						<div className='col-md-11 col-md-offset-1'>
							<div className='col-md-3'>
								<Input
									type='text'
									label='Width (mm)'
									ref='width'
									defaultValue={initialWidth}
									labelClassName='col-md-7'
									wrapperClassName='col-md-5' />
							</div>
							<div className='col-md-3'>
								<Input
									type='text'
									label='Height (mm)'
									ref='height'
									defaultValue={initialHeight}
									labelClassName='col-md-7'
									wrapperClassName='col-md-5' />
							</div>
							<div className='col-md-3'>
								<Input
									type='text'
									label='Depth (mm)'
									ref='depth'
									defaultValue={initialDepth}
									labelClassName='col-md-7'
									wrapperClassName='col-md-5' />
							</div>
						</div>
					</div>
					<hr/>
					<Identifiers
						identifiers={initialIdentifiers}
						types={this.props.identifierTypes}
						ref='identifiers' />
					<Input
						type='text'
						label='Disambiguation'
						ref='disambiguation'
						defaultValue={initialDisambiguation}
						labelClassName='col-md-3'
						wrapperClassName='col-md-6' />
					<Input
						type='textarea'
						label='Annotation'
						ref='annotation'
						defaultValue={initialAnnotation}
						labelClassName='col-md-3'
						wrapperClassName='col-md-6'
						rows='6' />
					<nav className='margin-top-1'>
						<ul className="pager">
							<li className="previous">
								<a href='#' onClick={this.props.backClick}><span aria-hidden="true" className='fa fa-angle-double-left'/> Back
								</a>
							</li>
							<li className="next">
								<a href='#' onClick={this.props.nextClick}>Next <span aria-hidden="true" className='fa fa-angle-double-right'/>
								</a>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		);
	}
});

module.exports = EditionData;
