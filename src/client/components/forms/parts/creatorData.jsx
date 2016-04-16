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
const Input = require('react-bootstrap').Input;
const Identifiers = require('./identifiers.jsx');
const Icon = require('react-fontawesome');

const validators = require('../../validators');

const CreatorData = React.createClass({
	displayName: 'creatorDataComponent',
	propTypes: {
		creator: React.PropTypes.shape({
			beginDate: React.PropTypes.string,
			endDate: React.PropTypes.string,
			ended: React.PropTypes.bool,
			gender: validators.namedProperty,
			creatorType: validators.labeledProperty,
			disambiguation: React.PropTypes.shape({
				comment: React.PropTypes.string
			}),
			annotation: React.PropTypes.shape({
				content: React.PropTypes.string
			}),
			identifiers: React.PropTypes.arrayOf(React.PropTypes.shape({
				id: React.PropTypes.number,
				value: React.PropTypes.string,
				typeId: React.PropTypes.number
			}))
		}),
		creatorTypes: React.PropTypes.arrayOf(validators.labeledProperty),
		genders: React.PropTypes.arrayOf(validators.namedProperty),
		identifierTypes: React.PropTypes.arrayOf(validators.labeledProperty),
		visible: React.PropTypes.bool,
		onBackClick: React.PropTypes.func,
		onNextClick: React.PropTypes.func
	},
	getInitialState() {
		'use strict';

		return {
			ended: this.props.creator ? this.props.creator.ended : false
		};
	},
	getValue() {
		'use strict';

		return {
			beginDate: this.begin.getValue(),
			endDate: this.ended.getChecked() ? this.end.getValue() : '',
			ended: this.ended.getChecked(),
			gender: this.gender.getValue(),
			creatorType: this.creatorType.getValue(),
			disambiguation: this.disambiguation.getValue(),
			annotation: this.annotation.getValue(),
			identifiers: this.identifiers.getValue()
		};
	},
	valid() {
		'use strict';

		return this.begin.valid() &&
			(!this.ended.getValue() || this.end.valid()) &&
			this.identifiers.valid();
	},
	handleEnded() {
		'use strict';

		this.setState({ended: this.ended.getChecked()});
	},
	render() {
		'use strict';

		let initialBeginDate = null;
		let initialEndDate = null;
		let initialGender = null;
		let initialCreatorType = null;
		let initialDisambiguation = null;
		let initialAnnotation = null;
		let initialIdentifiers = [];

		const prefillData = this.props.creator;
		if (prefillData) {
			initialBeginDate = prefillData.beginDate;
			initialEndDate = prefillData.endDate;
			initialGender = prefillData.gender ?
				prefillData.gender.id : null;
			initialCreatorType = prefillData.creatorType ?
				prefillData.creatorType.id : null;
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
			width: '100%'
		};

		return (
			<div className={this.props.visible === false ? 'hidden' : ''}>
				<h2>Add Data</h2>
				<p className="lead">
					Fill out any data you know about the entity.
				</p>

				<div className="form-horizontal">
					<PartialDate
						defaultValue={initialBeginDate}
						label="Begin Date"
						labelClassName="col-md-4"
						placeholder="YYYY-MM-DD"
						ref={(ref) => this.begin = ref}
						wrapperClassName="col-md-4"
					/>
					<PartialDate
						defaultValue={initialEndDate}
						groupClassName={this.state.ended ? '' : 'hidden'}
						label="End Date"
						labelClassName="col-md-4"
						placeholder="YYYY-MM-DD"
						ref={(ref) => this.end = ref}
						wrapperClassName="col-md-4"
					/>
					<Input
						defaultChecked={this.state.ended}
						label="Ended"
						ref={(ref) => this.ended = ref}
						type="checkbox"
						wrapperClassName="col-md-offset-4 col-md-4"
						onChange={this.handleEnded}
					/>
					<Select
						noDefault
						defaultValue={initialGender}
						idAttribute="id"
						label="Gender"
						labelAttribute="name"
						labelClassName="col-md-4"
						options={this.props.genders}
						placeholder="Select gender…"
						ref={(ref) => this.gender = ref}
						select2Options={select2Options}
						wrapperClassName="col-md-4"
					/>
					<Select
						noDefault
						defaultValue={initialCreatorType}
						idAttribute="id"
						label="Type"
						labelAttribute="label"
						labelClassName="col-md-4"
						options={this.props.creatorTypes}
						placeholder="Select creator type…"
						ref={(ref) => this.creatorType = ref}
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
});

module.exports = CreatorData;
