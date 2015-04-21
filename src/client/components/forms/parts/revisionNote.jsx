var React = require('react');
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;

var RevisionNote = React.createClass({
  render: function() {
    return (
      <div className={(this.props.visible === false) ? "hidden": "" }>
        <h2>Submit Revision</h2>
        <p className='lead'>Finally, add this revision to an edit.</p>

        <div className="form-horizontal">
          <Input
            type='textarea'
            label='Revision Note'
            ref='note'
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
    					<Button bsStyle='success' block type="submit" disabled={this.props.submitDisabled} onClick={this.props.onSubmit}>Submit</Button>
    				</div>
    			</div>
        </div>
      </div>
    );
  }
});

module.exports = RevisionNote;
