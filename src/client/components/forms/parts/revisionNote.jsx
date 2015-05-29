var React = require('react');
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;

var RevisionNote = React.createClass({
	render: function() {
		return (
			<div className={(this.props.visible === false) ? 'hidden': '' }>
				<h2>Submit Revision</h2>
				<p className='lead'>Finally, add this revision to an edit.</p>

				<div className='form-horizontal'>
					<Input
						type='textarea'
						label='Revision Note'
						ref='note'
						labelClassName='col-md-3'
						wrapperClassName='col-md-6'
						rows='6' />
				</div>

				<nav className='margin-top-1'>
					<ul className="pager">
						<li className="previous">
							<a href='#' onClick={this.props.backClick}><span aria-hidden="true" className='fa fa-angle-double-left'/> Back
							</a>
						</li>
						<li className="next">
							<a href='#' onClick={this.props.onSubmit} disabled={this.props.submitDisabled}>Submit
							</a>
						</li>
					</ul>
				</nav>
			</div>
		);
	}
});

module.exports = RevisionNote;
