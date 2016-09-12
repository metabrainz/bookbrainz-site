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

const Input = require('react-bootstrap').Input;

const Identifiers = require('./identifier-list');
const Select = require('../../input/select2');

const validators = require('../../../helpers/react-validators');

(() => {
	'use strict';

	class WorkData extends React.Component {
		getValue() {
			return {
				languages: this.languages.getValue(),
				workType: this.workType.getValue(),
				disambiguation: this.disambiguation.getValue(),
				annotation: this.annotation.getValue(),
				identifiers: this.identifiers.getValue()
			};
		}

		valid() {
			return this.identifiers.valid();
		}

		render() {
			let initialLanguages = [];
			let initialWorkType = null;
			let initialDisambiguation = null;
			let initialAnnotation = null;
			let initialIdentifiers = [];

			const prefillData = this.props.work;
			if (prefillData) {
				initialLanguages = prefillData.languageSet &&
					prefillData.languageSet.languages.map(
						(language) => language.id
					);
				initialWorkType = prefillData.workType ?
					prefillData.workType.id : null;
				initialDisambiguation = prefillData.disambiguation ?
					prefillData.disambiguation.comment : null;
				initialAnnotation = prefillData.annotation ?
					prefillData.annotation.content : null;
				initialIdentifiers = prefillData.identifierSet &&
					prefillData.identifierSet.identifiers.map((identifier) => ({
						id: identifier.id,
						value: identifier.value,
						typeId: identifier.type.id
					}));
			}

			const select2Options = {
				allowClear: true,
				width: '100%'
			};

			return (
				<div className={(this.props.visible === false) ? 'hidden' : ''}>
					<h2>Add Data</h2>
					<p className="lead">
						Fill out any data you know about the entity.
					</p>

					<div className="form-horizontal">
						<Select
							multiple
							noDefault
							defaultValue={initialLanguages}
							idAttribute="id"
							label="Languages"
							labelAttribute="name"
							labelClassName="col-md-4"
							options={this.props.languages}
							placeholder="Select work languages…"
							ref={(ref) => this.languages = ref}
							select2Options={select2Options}
							wrapperClassName="col-md-4"
						/>
						<Select
							noDefault
							defaultValue={initialWorkType}
							idAttribute="id"
							label="Type"
							labelAttribute="label"
							labelClassName="col-md-4"
							options={this.props.workTypes}
							placeholder="Select work type…"
							ref={(ref) => this.workType = ref}
							select2Options={select2Options}
							wrapperClassName="col-md-4"
						/>
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
	}

	WorkData.displayName = 'WorkData';
	WorkData.propTypes = {
		identifierTypes: React.PropTypes.arrayOf(
			validators.labeledProperty
		),
		languages: React.PropTypes.arrayOf(validators.namedProperty),
		visible: React.PropTypes.bool,
		work: React.PropTypes.shape({
			annotation: React.PropTypes.shape({
				content: React.PropTypes.string
			}),
			disambiguation: React.PropTypes.shape({
				comment: React.PropTypes.string
			}),
			identifiers: React.PropTypes.arrayOf(React.PropTypes.shape({
				id: React.PropTypes.number,
				value: React.PropTypes.string,
				typeId: React.PropTypes.number
			})),
			workType: validators.labeledProperty
		}),
		workTypes: React.PropTypes.arrayOf(validators.labeledProperty),
		onBackClick: React.PropTypes.func,
		onNextClick: React.PropTypes.func
	};

	module.exports = WorkData;
})();
