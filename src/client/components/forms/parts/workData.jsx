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
const Select = require('../../input/select2.jsx');
const Input = require('react-bootstrap').Input;
const Button = require('react-bootstrap').Button;
const Identifiers = require('./identifiers.jsx');


const WorkData = React.createClass({
	displayName: 'workDataComponent',
	getValue() {
		'use strict';

		return {
			languages: this.refs.languages.getValue(),
			workType: this.refs.workType.getValue(),
			disambiguation: this.refs.disambiguation.getValue(),
			annotation: this.refs.annotation.getValue(),
			identifiers: this.refs.identifiers.getValue()
		};
	},
	valid() {
		'use strict';

		return true;
	},
	render() {
		'use strict';

		let initialLanguages = [];
		let initialWorkType = null;
		let initialDisambiguation = null;
		let initialAnnotation = null;
		let initialIdentifiers = [];
		if (this.props.work) {
			initialLanguages = this.props.work.languages.map(function(language) {
				return language.language_id;
			});
			initialWorkType = this.props.work.work_type ? this.props.work.work_type.work_type_id : null;
			initialDisambiguation = this.props.work.disambiguation ? this.props.work.disambiguation.comment : null;
			initialAnnotation = this.props.work.annotation ? this.props.work.annotation.content : null;
			initialIdentifiers = this.props.work.identifiers.map(function(identifier) {
				return {
					id: identifier.id,
					value: identifier.value,
					type: identifier.identifier_type.identifier_type_id
				};
			});
		}

		const select2Options = {
			width: '100%'
		};

		return (
			<div className={(this.props.visible === false) ? 'hidden' : ''}>
				<h2>Add Data</h2>
				<p className="lead">Fill out any data you know about the entity.</p>

				<div className="form-horizontal">
					<Select
						defaultValue={initialLanguages}
						idAttribute="id"
						label="Languages"
						labelAttribute="name"
						labelClassName="col-md-4"
						multiple
						noDefault
						options={this.props.languages}
						placeholder="Select work languages…"
						ref="languages"
						select2Options={select2Options}
						wrapperClassName="col-md-4"
					/>
					<Select
						defaultValue={initialWorkType}
						idAttribute="id"
						label="Type"
						labelAttribute="label"
						labelClassName="col-md-4"
						noDefault
						options={this.props.workTypes}
						placeholder="Select work type…"
						ref="workType"
						select2Options={select2Options}
						wrapperClassName="col-md-4"
					/>
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
									<span
										aria-hidden="true"
										className="fa fa-angle-double-left"
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
									<span
										aria-hidden="true"
										className="fa fa-angle-double-right"
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

module.exports = WorkData;
