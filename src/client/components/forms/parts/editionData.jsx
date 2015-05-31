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
		return {
			publication: this.refs.publication.getValue(),
			publisher: this.refs.publisher.getValue() == '' ? null : this.refs.publisher.getValue(),
			releaseDate: this.refs.release.getValue(),
			language: this.refs.language.getValue(),
			editionStatus: this.refs.editionStatus.getValue(),
			disambiguation: this.refs.disambiguation.getValue(),
			annotation: this.refs.annotation.getValue(),
			identifiers: this.refs.identifiers.getValue()
		};
	},
	valid: function() {
		return this.refs.release.valid() && this.refs.publication.getValue().length;
	},
	render: function() {
		if (this.props.edition) {
			if (this.props.edition.publication) {
				var initialPublication = {
					id: this.props.edition.publication.bbid,
					text: this.props.edition.publication.default_alias ? this.props.edition.publication.default_alias.name : null
				};
			}

			if (this.props.edition.publisher) {
				var initialPublisher = {
					id: this.props.edition.publisher.bbid,
					text: this.props.edition.publisher.default_alias ? this.props.edition.publisher.default_alias.name : null
				};
			}

			var initialReleaseDate = this.props.edition.release_date;
			var initialLanguage = this.props.edition.language ? this.props.edition.language.language_id : null;
			var initialEditionStatus = this.props.edition.edition_status ? this.props.edition.edition_status.edition_status_id : null;
			var initialDisambiguation = this.props.edition.disambiguation ? this.props.edition.disambiguation.comment : null;
			var initialAnnotation = this.props.edition.annotation ? this.props.edition.annotation.content : null;
			var initialIdentifiers = this.props.edition.identifiers.map(function(identifier) {
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
			<div className={(this.props.visible === false) ? 'hidden': '' }>
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
					<div className='form-group margin-top-1'>
						<div className='col-md-1'>
							<Button bsStyle='primary' block onClick={this.props.backClick}>
								<span className='fa fa-angle-double-left' /> Back
							</Button>
						</div>
						<div className='col-md-1 col-md-offset-10'>
							<Button bsStyle='success' block onClick={this.props.nextClick}>
								Next <span className='fa fa-angle-double-right' />
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = EditionData;
