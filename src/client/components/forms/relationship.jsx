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
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var PageHeader = require('react-bootstrap').PageHeader;
var Select = require('../input/select2.jsx');
var _ = require('underscore');

function getRelationshipTypeById(relationships, id) {
	console.log(relationships);
	return _.find(relationships, (relationship) => relationship.id === parseInt(id));
}

var RelationshipRow = React.createClass({
	getInitialState: function() {
		return {a: "Bob", b: "Jimmy", relationshipType: null, deleted: false};
	},
	swap: function() {
		this.setState({a: this.state.b, b: this.state.a});
	},
	delete: function() {
		this.setState({deleted: true});
	},
	reset: function() {
		this.setState({deleted: false});
	},
	onChange: function() {
		this.setState({
			a: this.refs.a.getValue(),
			b: this.refs.b.getValue(),
			relationshipType: getRelationshipTypeById(
				this.props.relationshipTypes, this.refs.sel.getValue()
			)
		});
	},
	renderedRelationship() {
		if(this.state.relationshipType) {
			return this.state.a + this.state.relationshipType.description + this.state.b;
		}

		return "";
	},
	rowClass() {
		return this.state.deleted ? " list-group-item-danger" : " list-group-item-success";
	},
	render: function() {
		const deleteButton = (
			<Button bsStyle="danger" onClick={this.delete}>
				<span className='fa fa-times'/>&nbsp;Delete
				<span className='sr-only'> Relationship</span>
			</Button>
		);

		const resetButton = (
			<Button bsStyle="primary" onClick={this.reset}>
				<span className='fa fa-undo'/>&nbsp;Reset
				<span className='sr-only'> Relationship</span>
			</Button>
		);

		const swapButton = (
			<Button bsStyle="primary" onClick={this.swap}>
				<span className='fa fa-exchange'/>&nbsp;Swap
				<span className='sr-only'> Entities</span>
			</Button>
		);

		return (
			<div className={"list-group-item margin-top-1" + this.rowClass()}>
				<div className="row">
					<div className="col-md-1 text-center margin-top-1">
						<Input className="margin-left-0" type="checkbox" label=" " disabled={this.state.deleted}/>
					</div>
					<div className="col-md-11">
						<div className="row">
							<div className="col-md-4">
								<Input ref="a" type="text" value={this.state.deleted ? '' : this.state.a} placeholder={this.state.deleted ? this.state.a : ''} disabled={this.state.deleted} onChange={this.onChange}/>
							</div>
							<div className="col-md-4">
								<Select
									placeholder='Select relationship type…'
									options={this.props.relationshipTypes}
									noDefault
									idAttribute='id'
									labelAttribute='label'
									ref='sel'
									onChange={this.onChange}
									disabled={this.state.deleted}
									select2Options={{width: '100%'}}
									/>
							</div>
							<div className="col-md-4">
								<Input ref="b" type="text" value={this.state.b} value={this.state.deleted ? '' : this.state.b} placeholder={this.state.deleted ? this.state.b : ''} disabled={this.state.deleted} onChange={this.onChange}/>
							</div>
						</div>
						<div className="row">
							<div className="col-md-9" style={{"verticalAlign": "bottom"}}>
								{this.renderedRelationship()}
							</div>
							<div className="col-md-3 text-right">
								{this.state.deleted ? null : swapButton}
								{this.state.deleted ? resetButton : deleteButton}
							</div>

						</div>
					</div>
				</div>

			</div>
		);
	}
});

var RelationshipEditor = React.createClass({
	render: function() {
		return (
			<div>
				<PageHeader>Relationship Editor</PageHeader>
				<div className="list-group">
					<RelationshipRow {...this.props}/>
					<RelationshipRow {...this.props}/>
					<RelationshipRow {...this.props}/>
				</div>
			</div>
		);
	}
});

module.exports = RelationshipEditor;
