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
const PartialDate = require('../../input/partialDate.jsx');
const Select = require('../../input/select2.jsx');
const SearchSelect = require('../../input/entity-search.jsx');
const Input = require('react-bootstrap').Input;
const Identifiers = require('./identifiers.jsx');
const Icon = require('react-fontawesome');

const validators = require('../../validators');

const editionStatusValidation = React.PropTypes.shape({
	id: React.PropTypes.number,
	label: React.PropTypes.string
});

const editionFormatValidation = React.PropTypes.shape({
	id: React.PropTypes.number,
	label: React.PropTypes.string
});

const EditionData = React.createClass({
	displayName: 'editionDataComponent',
	propTypes: {
		backClick: React.PropTypes.func,
		edition: React.PropTypes.shape({
			annotation: React.PropTypes.shape({
				content: React.PropTypes.string
			}),
			depth: React.PropTypes.number,
			disambiguation: React.PropTypes.shape({
				comment: React.PropTypes.string
			}),
			editionFormat: editionFormatValidation,
			editionStatus: editionStatusValidation,
			height: React.PropTypes.number,
			identifiers: React.PropTypes.arrayOf(React.PropTypes.shape({
				id: React.PropTypes.number,
				value: React.PropTypes.string,
				identifierType: validators.identifierType
			})),
			languages: React.PropTypes.arrayOf(React.PropTypes.shape({
				id: React.PropTypes.number
			})),
			pages: React.PropTypes.number,
			publication: React.PropTypes.shape({
				bbid: React.PropTypes.string,
				defaultAlias: React.PropTypes.shape({
					name: React.PropTypes.string
				})
			}),
			publishers: React.PropTypes.arrayOf(React.PropTypes.shape({
				bbid: React.PropTypes.string,
				defaultAlias: React.PropTypes.shape({
					name: React.PropTypes.string
				})
			})),
			releaseDate: React.PropTypes.string,
			weight: React.PropTypes.number,
			width: React.PropTypes.number
		}),
		editionFormats: React.PropTypes.arrayOf(editionFormatValidation),
		editionStatuses: React.PropTypes.arrayOf(editionStatusValidation),
		identifierTypes: React.PropTypes.arrayOf(validators.identifierType),
		languages: React.PropTypes.arrayOf(React.PropTypes.shape({
			id: React.PropTypes.number,
			name: React.PropTypes.string
		})),
		nextClick: React.PropTypes.func,
		publication: React.PropTypes.shape({
			bbid: React.PropTypes.string,
			defaultAlias: React.PropTypes.shape({
				name: React.PropTypes.string
			})
		}),
		publishers: React.PropTypes.arrayOf(React.PropTypes.shape({
			bbid: React.PropTypes.string,
			defaultAlias: React.PropTypes.shape({
				name: React.PropTypes.string
			})
		})),
		visible: React.PropTypes.bool
	},
	getValue() {
		'use strict';

		const publication = this.refs.publication.getValue();

		return {
			publication: publication ? publication.bbid : null,
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
	valid() {
		'use strict';

		return Boolean(
			this.refs.release.valid() && this.refs.publication.getValue()
		);
	},
	render() {
		'use strict';

		let initialPublication = null;
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

		let publication = null;
		const prefillData = this.props.edition;
		if (prefillData) {
			if (prefillData.publication) {
				publication = prefillData.publication;
			}

			initialReleaseDate = prefillData.releaseDate;
			initialLanguages = prefillData.revision.data.languages.map(
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
			initialIdentifiers =
				prefillData.identifierSet.identifiers.map((identifier) => ({
					id: identifier.id,
					value: identifier.value,
					type: identifier.type.id
				}));
		}

		if (this.props.publication) {
			publication = this.props.publication;
		}

		if (publication) {
			initialPublication = {
				id: publication.bbid,
				text: publication.defaultAlias ?
					publication.defaultAlias.name : null
			};
		}

		const select2Options = {
			width: '100%'
		};

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
						ref="publication"
						select2Options={select2Options}
						wrapperClassName="col-md-4"
					/>
					<PartialDate
						defaultValue={initialReleaseDate}
						label="Release Date"
						labelClassName="col-md-4"
						placeholder="YYYY-MM-DD"
						ref="release"
						wrapperClassName="col-md-4"
					/>
					<Select
						defaultValue={initialLanguages}
						idAttribute="id"
						label="Languages"
						labelAttribute="name"
						labelClassName="col-md-4"
						multiple
						noDefault
						options={this.props.languages}
						placeholder="Select edition languages…"
						ref="languages"
						select2Options={select2Options}
						wrapperClassName="col-md-4"
					/>
					<Select
						defaultValue={initialEditionFormat}
						idAttribute="id"
						label="Format"
						labelAttribute="label"
						labelClassName="col-md-4"
						noDefault
						options={this.props.editionFormats}
						placeholder="Select edition format…"
						ref="editionFormat"
						select2Options={select2Options}
						wrapperClassName="col-md-4"
					/>
					<Select
						defaultValue={initialEditionStatus}
						idAttribute="id"
						label="Status"
						labelAttribute="label"
						labelClassName="col-md-4"
						noDefault
						options={this.props.editionStatuses}
						placeholder="Select edition status…"
						ref="editionStatus"
						select2Options={select2Options}
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
									ref="pages"
									type="text"
									wrapperClassName="col-md-5"
								/>
							</div>
							<div className="col-md-3">
								<Input
									defaultValue={initialWeight}
									label="Weight (g)"
									labelClassName="col-md-7"
									ref="weight"
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
									ref="width"
									type="text"
									wrapperClassName="col-md-5"
								/>
							</div>
							<div className="col-md-3">
								<Input
									defaultValue={initialHeight}
									label="Height (mm)"
									labelClassName="col-md-7"
									ref="height"
									type="text"
									wrapperClassName="col-md-5"
								/>
							</div>
							<div className="col-md-3">
								<Input
									defaultValue={initialDepth}
									label="Depth (mm)"
									labelClassName="col-md-7"
									ref="depth"
									type="text"
									wrapperClassName="col-md-5"
								/>
							</div>
						</div>
					</div>
					<hr/>
					<Identifiers
						identifiers={initialIdentifiers}
						ref="identifiers"
						types={this.props.identifierTypes}
					/>
					<Input
						defaultValue={initialDisambiguation}
						label="Disambiguation"
						labelClassName="col-md-3"
						ref="disambiguation"
						type="text"
						wrapperClassName="col-md-6"
					/>
					<Input
						defaultValue={initialAnnotation}
						label="Annotation"
						labelClassName="col-md-3"
						ref="annotation"
						rows="6"
						type="textarea"
						wrapperClassName="col-md-6"
					/>
					<nav className="margin-top-1">
						<ul className="pager">
							<li className="previous">
								<a
									href="#"
									onClick={this.props.backClick}
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
									onClick={this.props.nextClick}
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
