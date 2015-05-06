var React = require('react');
var PartialDate = require('../../input/partialDate.jsx');
var Select = require('../../input/select.jsx');
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Identifiers = require('./identifiers.jsx');


var EditionData = React.createClass({
	getValue: function() {
		return {
			beginDate: this.refs.begin.getValue(),
			endDate: this.refs.end.getValue(),
			ended: this.refs.ended.getValue(),
			language: this.refs.language.getValue(),
			editionStatus: this.refs.editionStatus.getValue(),
			disambiguation: this.refs.disambiguation.getValue(),
			annotation: this.refs.annotation.getValue(),
			identifiers: this.refs.identifiers.getValue()
		};
	},
	getInitialState: function() {
		return {
			ended: this.props.edition ? this.props.edition.ended : false
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
		if (this.props.edition) {
			var initialBeginDate = this.props.edition.begin_date;
			var initialEndDate = this.props.edition.end_date;
			var initialLanguage = this.props.edition.language ? this.props.edition.language.language_id : null;
			var initialEditionStatus = this.props.edition.edition_status ? this.props.edition.edition_status.edition_status_id : null;
			var initialDisambiguation = this.props.edition.disambiguation ? this.props.edition.disambiguation.comment : null;
			var initialAnnotation = this.props.edition.annotation ? this.props.edition.annotation.content : null;
		}

		var select2Options = {
			width: '100%'
		};

		return (
			<div className={(this.props.visible === false) ? 'hidden': '' }>
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
						defaultValue={this.state.ended}
						label='Ended'
						onChange={this.handleEnded}
						wrapperClassName='col-md-offset-4 col-md-4' />
					<Select
						label='Language'
						labelAttribute='name'
						idAttribute='id'
						defaultValue={initialLanguage}
						ref='language'
						placeholder='Select edition language…'
						noDefault
						options={this.props.languages}
						select2Options={select2Options}
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<Select
						label='Status'
						labelAttribute='label'
						idAttribute='id'
						defaultValue={initialEditionStatus}
						ref='editionStatus'
						placeholder='Select edition status…'
						noDefault
						options={this.props.editionStatuses}
						select2Options={select2Options}
						labelClassName='col-md-4'
						wrapperClassName='col-md-4' />
					<hr/>
					<Identifiers
						identifiers={this.props.identifiers}
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
