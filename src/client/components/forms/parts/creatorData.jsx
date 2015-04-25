var React = require('react');
var PartialDate = require('../../input/partialDate.jsx');
var Select = require('../../input/select.jsx');
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;


var CreatorData = React.createClass({
  getValue: function() {
    return {
      beginDate: this.refs.begin.getValue(),
      endDate: this.refs.end.getValue(),
      ended: this.refs.ended.getValue(),
      gender: this.refs.gender.getValue(),
      creatorType: this.refs.creatorType.getValue(),
      disambiguation: this.refs.disambiguation.getValue(),
      annotation: this.refs.annotation.getValue()
    };
  },
  getInitialState: function() {
    return {
      ended: this.props.creator ? this.props.creator.ended : false
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
    if(this.props.creator) {
      var initialBeginDate = this.props.creator.begin_date;
      var initialEndDate = this.props.creator.end_date;
      var initialGender = this.props.creator.gender.gender_id;
      var initialCreatorType = this.props.creator.creator_type.creator_type_id;
      var initialDisambiguation = this.props.creator.disambiguation.comment;
      var initialAnnotation = this.props.creator.annotation.content;
    }

    return (
      <div className={(this.props.visible === false) ? "hidden": "" }>
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
            label='Ended'
            defaultValue={this.state.ended}
            onChange={this.handleEnded}
            wrapperClassName='col-md-offset-4 col-md-4' />
          <Select
            label='Gender'
            labelAttribute='name'
            idAttribute='id'
            defaultValue={initialGender}
            ref='gender'
            placeholder='Select gender…'
            noDefault
            options={this.props.genders}
            labelClassName='col-md-4'
            wrapperClassName='col-md-4' />
          <Select
            label='Type'
            labelAttribute='label'
            idAttribute='id'
            defaultValue={initialCreatorType}
            ref='creatorType'
            placeholder='Select creator type…'
            noDefault
            options={this.props.creatorTypes}
            labelClassName='col-md-4'
            wrapperClassName='col-md-4' />
          <hr/>
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
                <span className="fa fa-angle-double-left" /> Back
              </Button>
            </div>
            <div className='col-md-1 col-md-offset-10'>
              <Button bsStyle='success' block onClick={this.props.nextClick}>
                Next <span className="fa fa-angle-double-right" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = CreatorData;
