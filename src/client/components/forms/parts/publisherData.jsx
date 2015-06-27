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
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Identifiers = require('./identifiers.jsx');


var PublisherData = React.createClass({
	getValue: function() {
		'use strict';

		return {
			beginDate: this.refs.begin.getValue(),
			endDate: this.refs.end.getValue(),
			ended: this.refs.ended.getChecked(),
			publisherType: this.refs.publisherType.getValue(),
			disambiguation: this.refs.disambiguation.getValue(),
			annotation: this.refs.annotation.getValue(),
			identifiers: this.refs.identifiers.getValue()
		};
	},
	getInitialState: function() {
		'use strict';

		return {
			ended: this.props.edition ? this.props.edition.ended : false
		};
	},
	valid: function() {
		'use strict';

		return (
			this.refs.begin.valid() && (!this.refs.ended.getValue() || this.refs.end.valid())
		);
	},
	handleEnded: function() {
		'use strict';

		this.setState({ended: this.refs.ended.getChecked()});
	},
	render: function() {
		'use strict';

		var initialBeginDate = null;
		var initialEndDate = null;
		var initialPublisherType = null;
		var initialDisambiguation = null;
		var initialAnnotation = null;
		var initialIdentifiers = [];

		if (this.props.publisher) {
			initialBeginDate = this.props.publisher.begin_date;
			initialEndDate = this.props.publisher.end_date;
			initialPublisherType = this.props.publisher.publisher_type ? this.props.publisher.publisher_type.publisher_type_id : null;
			initialDisambiguation = this.props.publisher.disambiguation ? this.props.publisher.disambiguation.comment : null;
			initialAnnotation = this.props.publisher.annotation ? this.props.publisher.annotation.content : null;
			initialIdentifiers = this.props.publisher.identifiers.map(function(identifier) {
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
					<PartialDate
						label='Begin Date'
						ref='begin'
						defaultValue={initialBeginDate}
						placeholder='YYYY-MM-DD'
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<PartialDate
						label='End Date'
						ref='end'
						defaultValue={initialEndDate}
						groupClassName={this.state.ended ? '' : 'hidden'}
						placeholder='YYYY-MM-DD'
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<Input
						type='checkbox'
						ref='ended'
						defaultChecked={this.state.ended}
						label='Ended'
						onChange={this.handleEnded}
						wrapperClassName='col-md-offset-4 col-md-4' />
					<Select
						label='Type'
						labelAttribute='label'
						idAttribute='id'
						defaultValue={initialPublisherType}
						ref='publisherType'
						placeholder='Select publisher type…'
						noDefault
						options={this.props.publisherTypes}
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

module.exports = PublisherData;
