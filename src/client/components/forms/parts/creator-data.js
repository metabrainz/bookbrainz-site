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
/* eslint no-return-assign: 0 */

import * as bootstrap from 'react-bootstrap';
import * as utilsHelper from '../../../helpers/utils';
import * as validators from '../../../helpers/react-validators';
import Icon from 'react-fontawesome';
import Identifiers from './identifier-list';
import PartialDate from '../../input/partial-date';
import React from 'react';
import SearchSelect from '../../input/entity-search';
import Select from '../../input/select2';

const {Input} = bootstrap;
const {injectDefaultAliasName} = utilsHelper;

class CreatorData extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			ended: this.props.creator ? this.props.creator.ended : false
		};

		// React does not autobind non-React class methods
		this.handleEnded = this.handleEnded.bind(this);
	}

	getValue() {
		const beginArea = this.beginArea.getValue();
		const endArea = this.endArea.getValue();
		return {
			annotation: this.annotation.getValue(),
			beginArea: beginArea ? beginArea.id : null,
			beginDate: this.begin.getValue(),
			creatorType: this.creatorType.getValue(),
			disambiguation: this.disambiguation.getValue(),
			endArea: endArea ? endArea.id : null,
			endDate: this.ended.getChecked() ? this.end.getValue() : '',
			ended: this.ended.getChecked(),
			gender: this.gender.getValue(),
			identifiers: this.identifiers.getValue()
		};
	}

	valid() {
		return this.begin.valid() &&
			(!this.ended.getValue() || this.end.valid()) &&
			this.identifiers.valid();
	}

	handleEnded() {
		this.setState({ended: this.ended.getChecked()});
	}

	render() {
		let initialBeginArea = null;
		let initialBeginDate = null;
		let initialEndDate = null;
		let initialEndArea = null;
		let initialGender = null;
		let initialCreatorType = null;
		let initialDisambiguation = null;
		let initialAnnotation = null;
		let initialIdentifiers = [];

		const prefillData = this.props.creator;
		if (prefillData) {
			if (prefillData.beginArea) {
				initialBeginArea = prefillData.beginArea;
			}
			if (prefillData.endArea) {
				initialEndArea = prefillData.endArea;
			}
			initialBeginDate = prefillData.beginDate;
			initialEndDate = prefillData.endDate;
			initialGender = prefillData.gender ? prefillData.gender.id : null;
			initialCreatorType = prefillData.creatorType ?
				prefillData.creatorType.id : null;
			initialDisambiguation = prefillData.disambiguation ?
				prefillData.disambiguation.comment : null;
			initialAnnotation = prefillData.annotation ?
				prefillData.annotation.content : null;
			initialIdentifiers = prefillData.identifierSet &&
				prefillData.identifierSet.identifiers.map((identifier) => ({
					id: identifier.id,
					typeId: identifier.type.id,
					value: identifier.value
				}));
		}

		const select2Options = {
			allowClear: true,
			width: '100%'
		};

		const dataTabVisibleClass = this.props.visible ? '' : 'hidden';
		const endDateVisibleClass = this.state.ended ? '' : 'hidden';
		return (
			<div className={dataTabVisibleClass}>
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
						groupClassName={endDateVisibleClass}
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
					<SearchSelect
						noDefault
						collection="area"
						defaultValue={injectDefaultAliasName(initialBeginArea)}
						label="Begin Area"
						labelClassName="col-md-4"
						placeholder="Select begin area..."
						ref={(ref) => this.beginArea = ref}
						select2Options={select2Options}
						wrapperClassName="col-md-4"
					/>
					<SearchSelect
						noDefault
						collection="area"
						defaultValue={injectDefaultAliasName(initialEndArea)}
						label="End Area"
						labelClassName="col-md-4"
						placeholder="Select end area..."
						ref={(ref) => this.endArea = ref}
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

CreatorData.displayName = 'CreatorData';
CreatorData.propTypes = {
	creator: React.PropTypes.shape({
		annotation: React.PropTypes.shape({
			content: React.PropTypes.string
		}),
		beginArea: validators.labeledProperty,
		beginDate: React.PropTypes.string,
		creatorType: validators.labeledProperty,
		disambiguation: React.PropTypes.shape({
			comment: React.PropTypes.string
		}),
		endArea: validators.labeledProperty,
		endDate: React.PropTypes.string,
		ended: React.PropTypes.bool,
		gender: validators.namedProperty,
		identifiers: React.PropTypes.arrayOf(React.PropTypes.shape({
			id: React.PropTypes.number,
			typeId: React.PropTypes.number,
			value: React.PropTypes.string
		}))
	}).isRequired,
	creatorTypes:
		React.PropTypes.arrayOf(validators.labeledProperty).isRequired,
	genders: React.PropTypes.arrayOf(validators.namedProperty).isRequired,
	identifierTypes: React.PropTypes.arrayOf(
		validators.labeledProperty
	).isRequired,
	onBackClick: React.PropTypes.func.isRequired,
	onNextClick: React.PropTypes.func.isRequired,
	visible: React.PropTypes.bool.isRequired
};

export default CreatorData;
