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

import * as bootstrap from 'react-bootstrap';
import * as validators from '../../../helpers/react-validators';
import Icon from 'react-fontawesome';
import Identifiers from './identifier-list';
import React from 'react';
import Select from '../../input/select2';

const {Input} = bootstrap;

class PublicationData extends React.Component {
	getValue() {
		return {
			annotation: this.annotation.getValue(),
			disambiguation: this.disambiguation.getValue(),
			identifiers: this.identifiers.getValue(),
			publicationType: this.publicationType.getValue()
		};
	}

	valid() {
		return this.identifiers.valid();
	}

	render() {
		let initialPublicationType = null;
		let initialDisambiguation = null;
		let initialAnnotation = null;
		let initialIdentifiers = [];

		const prefillData = this.props.publication;
		if (prefillData) {
			initialPublicationType = prefillData.publicationType ?
				prefillData.publicationType.id : null;
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

		const publicationDataVisibleClass = this.props.visible ? '' : 'hidden';
		return (
			<div className={publicationDataVisibleClass}>
				<h2>Add Data</h2>
				<p className="lead">
					Fill out any data you know about the entity.
				</p>

				<div className="form-horizontal">
					<Select
						noDefault
						defaultValue={initialPublicationType}
						idAttribute="id"
						label="Type"
						labelAttribute="label"
						labelClassName="col-md-4"
						options={this.props.publicationTypes}
						placeholder="Select publication type…"
						ref={(ref) => this.publicationType = ref}
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

PublicationData.displayName = 'PublicationData';
PublicationData.propTypes = {
	identifierTypes:
		React.PropTypes.arrayOf(validators.labeledProperty).isRequired,
	onBackClick: React.PropTypes.func.isRequired,
	onNextClick: React.PropTypes.func.isRequired,
	publication: React.PropTypes.shape({
		annotation: React.PropTypes.shape({
			content: React.PropTypes.string
		}),
		disambiguation: React.PropTypes.shape({
			comment: React.PropTypes.string
		}),
		identifiers: React.PropTypes.arrayOf(React.PropTypes.shape({
			id: React.PropTypes.number,
			typeId: React.PropTypes.number,
			value: React.PropTypes.string
		})),
		publicationType: validators.labeledProperty
	}).isRequired,
	publicationTypes:
		React.PropTypes.arrayOf(validators.labeledProperty).isRequired,
	visible: React.PropTypes.bool.isRequired
};

export default PublicationData;
