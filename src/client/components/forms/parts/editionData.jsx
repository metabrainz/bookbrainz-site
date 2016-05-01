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

const Icon = require('react-fontawesome');
const React = require('react');
const _assign = require('lodash.assign');

const Input = require('react-bootstrap').Input;

const Identifiers = require('./identifier-list.jsx');
const PartialDate = require('../../input/partialDate.jsx');
const SearchSelect = require('../../input/entity-search.jsx');
const Select = require('../../input/select2.jsx');

const validators = require('../../../helpers/react-validators');

const EditionData = React.createClass({
	displayName: 'editionDataComponent',
	propTypes: {
		edition: React.PropTypes.shape({
			annotation: React.PropTypes.shape({
				content: React.PropTypes.string
			}),
			depth: React.PropTypes.number,
			disambiguation: React.PropTypes.shape({
				comment: React.PropTypes.string
			}),
			editionFormat: validators.labeledProperty,
			editionStatus: validators.labeledProperty,
			height: React.PropTypes.number,
			identifiers: React.PropTypes.arrayOf(React.PropTypes.shape({
				id: React.PropTypes.number,
				value: React.PropTypes.string,
				typeId: React.PropTypes.number
			})),
			languages: React.PropTypes.arrayOf(validators.namedProperty),
			pages: React.PropTypes.number,
			publication: validators.entityProperty,
			publishers: React.PropTypes.arrayOf(validators.entityProperty),
			releaseDate: React.PropTypes.string,
			weight: React.PropTypes.number,
			width: React.PropTypes.number
		}),
		editionFormats: React.PropTypes.arrayOf(validators.labeledProperty),
		editionStatuses: React.PropTypes.arrayOf(validators.labeledProperty),
		identifierTypes: React.PropTypes.arrayOf(validators.labeledProperty),
		languages: React.PropTypes.arrayOf(validators.namedProperty),
		publication: validators.entityProperty,
		publisher: validators.entityProperty,
		visible: React.PropTypes.bool,
		onBackClick: React.PropTypes.func,
		onNextClick: React.PropTypes.func
	},
	getValue() {
		'use strict';

		const publication = this.publication.getValue();
		const publisher = this.publisher.getValue();

		const releaseEvents = [];

		// If the release date field isn't empty, create a release event
		// object to represent it
		if (this.release.getValue()) {
			const edition = this.props.edition;

			const releaseEventId = edition && edition.releaseEventSet &&
					edition.releaseEventSet.releaseEvents ?
				edition.releaseEventSet.releaseEvents[0].id : null;

			releaseEvents.push({
				id: releaseEventId,
				date: this.release.getValue()
			});
		}

		return {
			publication: publication ? publication.bbid : null,
			publishers: publisher ? [publisher.bbid] : null,
			releaseEvents,
			languages: this.languages.getValue().map(
				(languageId) => parseInt(languageId, 10)
			),
			editionFormat: this.editionFormat.getValue(),
			editionStatus: this.editionStatus.getValue(),
			disambiguation: this.disambiguation.getValue(),
			annotation: this.annotation.getValue(),
			identifiers: this.identifiers.getValue(),
			pages: this.pages.getValue(),
			width: this.width.getValue(),
			height: this.height.getValue(),
			depth: this.depth.getValue(),
			weight: this.weight.getValue()
		};
	},
	valid() {
		'use strict';

		return Boolean(
			this.release.valid() && this.publication.getValue() &&
				this.identifiers.valid()
		);
	},
	render() {
		'use strict';

		let initialPublication = null;
		let initialPublisher = null;
		let initialReleaseDate = null;
		let initialLanguages = [];
		let initialEditionFormat = null;
		let initialEditionStatus = null;
		let initialDisambiguation = null;
		let initialAnnotation = null;
		let initialIdentifiers = [];
		let initialPages = null;
		let initialWidth = null;
		let initialHeight = null;
		let initialDepth = null;
		let initialWeight = null;

		const prefillData = this.props.edition;
		if (prefillData) {
			if (prefillData.publication) {
				initialPublication = prefillData.publication;
			}

			if (prefillData.publisherSet &&
				prefillData.publisherSet.publishers) {
				initialPublisher = prefillData.publisherSet.publishers[0];
			}

			if (prefillData.releaseEventSet &&
				prefillData.releaseEventSet.releaseEvents) {
				initialReleaseDate =
					prefillData.releaseEventSet.releaseEvents[0].date;
			}

			initialLanguages = prefillData.languageSet &&
				prefillData.languageSet.languages.map(
					(language) => language.id
				);

			initialEditionFormat = prefillData.editionFormat ?
				prefillData.editionFormat.id : null;
			initialEditionStatus = prefillData.editionStatus ?
				prefillData.editionStatus.id : null;
			initialDisambiguation = prefillData.disambiguation ?
				prefillData.disambiguation.comment : null;
			initialAnnotation = prefillData.annotation ?
				prefillData.annotation.content : null;
			initialPages = prefillData.pages || prefillData.pages === 0 ?
				prefillData.pages : null;
			initialWidth = prefillData.width || prefillData.width === 0 ?
				prefillData.width : null;
			initialHeight = prefillData.height || prefillData.height === 0 ?
				prefillData.height : null;
			initialDepth = prefillData.depth || prefillData.depth === 0 ?
				prefillData.depth : null;
			initialWeight = prefillData.weight || prefillData.weight === 0 ?
				prefillData.weight : null;
			initialIdentifiers = prefillData.identifierSet &&
				prefillData.identifierSet.identifiers.map((identifier) => ({
					id: identifier.id,
					value: identifier.value,
					typeId: identifier.type.id
				}));
		}

		if (this.props.publication) {
			initialPublication = this.props.publication;
		}

		if (this.props.publisher) {
			initialPublisher = this.props.publisher;
		}

		const defaultSelect2Options = {
			allowClear: true,
			width: '100%'
		};

		const publicationSelect2Options =
			_assign({}, defaultSelect2Options);

		publicationSelect2Options.allowClear = false;

		return (
			<div className={this.props.visible === false ? 'hidden' : ''}>
				<h2>Add Data</h2>
				<p className="lead">
					Fill out any data you know about the entity.
				</p>

				<div className="form-horizontal">
					<SearchSelect
						collection="publication"
						defaultValue={initialPublication}
						label="Publication"
						labelAttribute="name"
						labelClassName="col-md-4"
						placeholder="Select publication…"
						ref={(ref) => this.publication = ref}
						select2Options={publicationSelect2Options}
						wrapperClassName="col-md-4"
					/>
					<SearchSelect
						nodefault
						collection="publisher"
						defaultValue={initialPublisher}
						label="Publisher"
						labelAttribute="name"
						labelClassName="col-md-4"
						placeholder="Select publisher…"
						ref={(ref) => this.publisher = ref}
						select2Options={defaultSelect2Options}
						wrapperClassName="col-md-4"
					/>
					<PartialDate
						defaultValue={initialReleaseDate}
						label="Release Date"
						labelClassName="col-md-4"
						placeholder="YYYY-MM-DD"
						ref={(ref) => this.release = ref}
						wrapperClassName="col-md-4"
					/>
					<Select
						multiple
						noDefault
						defaultValue={initialLanguages}
						idAttribute="id"
						label="Languages"
						labelAttribute="name"
						labelClassName="col-md-4"
						options={this.props.languages}
						placeholder="Select edition languages…"
						ref={(ref) => this.languages = ref}
						select2Options={defaultSelect2Options}
						wrapperClassName="col-md-4"
					/>
					<Select
						noDefault
						defaultValue={initialEditionFormat}
						idAttribute="id"
						label="Format"
						labelAttribute="label"
						labelClassName="col-md-4"
						options={this.props.editionFormats}
						placeholder="Select edition format…"
						ref={(ref) => this.editionFormat = ref}
						select2Options={defaultSelect2Options}
						wrapperClassName="col-md-4"
					/>
					<Select
						noDefault
						defaultValue={initialEditionStatus}
						idAttribute="id"
						label="Status"
						labelAttribute="label"
						labelClassName="col-md-4"
						options={this.props.editionStatuses}
						placeholder="Select edition status…"
						ref={(ref) => this.editionStatus = ref}
						select2Options={defaultSelect2Options}
						wrapperClassName="col-md-4"
					/>
					<hr/>
					<div className="row">
						<div className="col-md-11 col-md-offset-1">
							<div className="col-md-3">
								<Input
									defaultValue={initialPages}
									label="Page Count"
									labelClassName="col-md-7"
									ref={(ref) => this.pages = ref}
									type="text"
									wrapperClassName="col-md-5"
								/>
							</div>
							<div className="col-md-3">
								<Input
									defaultValue={initialWeight}
									label="Weight (g)"
									labelClassName="col-md-7"
									ref={(ref) => this.weight = ref}
									type="text"
									wrapperClassName="col-md-5"
								/>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-md-11 col-md-offset-1">
							<div className="col-md-3">
								<Input
									defaultValue={initialWidth}
									label="Width (mm)"
									labelClassName="col-md-7"
									ref={(ref) => this.width = ref}
									type="text"
									wrapperClassName="col-md-5"
								/>
							</div>
							<div className="col-md-3">
								<Input
									defaultValue={initialHeight}
									label="Height (mm)"
									labelClassName="col-md-7"
									ref={(ref) => this.height = ref}
									type="text"
									wrapperClassName="col-md-5"
								/>
							</div>
							<div className="col-md-3">
								<Input
									defaultValue={initialDepth}
									label="Depth (mm)"
									labelClassName="col-md-7"
									ref={(ref) => this.depth = ref}
									type="text"
									wrapperClassName="col-md-5"
								/>
							</div>
						</div>
					</div>
					<hr/>
					<Identifiers
						identifiers={initialIdentifiers}
						ref={(ref) => this.identifiers = ref}
						types={this.props.identifierTypes}
					/>
					<Input
						defaultValue={initialDisambiguation}
						label="Disambiguation"
						labelClassName="col-md-3"
						ref={(ref) => this.disambiguation = ref}
						type="text"
						wrapperClassName="col-md-6"
					/>
					<Input
						defaultValue={initialAnnotation}
						label="Annotation"
						labelClassName="col-md-3"
						ref={(ref) => this.annotation = ref}
						rows="6"
						type="textarea"
						wrapperClassName="col-md-6"
					/>
					<nav className="margin-top-1">
						<ul className="pager">
							<li className="previous">
								<a
									href="#"
									onClick={this.props.onBackClick}
								>
									<Icon
										aria-hidden="true"
										name="angle-double-left"
									/>
									Back
								</a>
							</li>
							<li className="next">
								<a
									href="#"
									onClick={this.props.onNextClick}
								>
									Next
									<Icon
										aria-hidden="true"
										name="angle-double-right"
									/>
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
