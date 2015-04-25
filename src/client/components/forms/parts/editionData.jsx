var React = require('react');
var PartialDate = require('../../input/partialDate.jsx');
var Select = require('../../input/select.jsx');
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;


var EditionData = React.createClass({
	getValue: function() {
		return {
			beginDate: this.refs.begin.getValue(),
			endDate: this.refs.end.getValue(),
			ended: this.refs.ended.getValue(),
			language: this.refs.language.getValue(),
			editionStatus: this.refs.editionStatus.getValue(),
			disambiguation: this.refs.disambiguation.getValue(),
			annotation: this.refs.annotation.getValue()
		};
	},
	getInitialState: function() {
		return {
			ended: false
		};
	},
	valid: function() {
		return (
			this.refs.begin.valid() && (!this.refs.ended.getValue() || this.refs.end.valid())
		);
	},
	handleEnded: function() {
		this.setState({ended: this.refs.ended.getChecked()});
	},
	render: function() {
		return (
			<div className={(this.props.visible === false) ? 'hidden': '' }>
				<h2>Add Data</h2>
				<p className='lead'>Fill out any data you know about the entity.</p>

				<div className='form-horizontal'>
					<PartialDate
						label='Begin Date'
						ref='begin'
						placeholder='YYYY-MM-DD'
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<PartialDate
						label='End Date'
						ref='end'
						groupClassName={this.state.ended ? '' : 'hidden'}
						placeholder='YYYY-MM-DD'
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<Input
						type='checkbox'
						ref='ended'
						label='Ended'
						onChange={this.handleEnded}
						wrapperClassName='col-md-offset-4 col-md-4' />
					<Select
						label='Language'
						labelAttribute='name'
						idAttribute='id'
						ref='language'
						placeholder='Select edition language…'
						noDefault
						options={this.props.languages}
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<Select
						label='Status'
						labelAttribute='label'
						idAttribute='id'
						ref='editionStatus'
						placeholder='Select edition status…'
						noDefault
						options={this.props.editionStatuses}
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<hr/>
					<Input
						type='text'
						label='Disambiguation'
						ref='disambiguation'
						labelClassName='col-md-3'
						wrapperClassName='col-md-6' />
					<Input
						type='textarea'
						label='Annotation'
						ref='annotation'
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
