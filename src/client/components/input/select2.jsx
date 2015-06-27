var React = require('react');
var select2 = require('Select2');
var Input = require('react-bootstrap').Input;

var Select = React.createClass({
	getValue: function() {
		'use strict';

		return this.refs.target.getValue();
	},
	componentDidMount: function() {
		'use strict';

		var select = $(this.refs.target.getInputDOMNode());

		var options = this.props.options || {};
		options.theme = 'bootstrap';

		if(this.props.placeholder) {
			options.placeholder = this.props.placeholder;
			if(!this.props.multiple) {
				options.allowClear = true;
			}
		}

		select.select2(options);
		select.on('change', this.props.onChange);
	},
	render: function() {
		'use strict';

		var self = this;
		var options = [];
		if (this.props.options) {
			options = this.props.options.map(function(op) {
				return (
					<option key={op[self.props.idAttribute]} value={op[self.props.idAttribute]}>
						{op[self.props.labelAttribute]}
					</option>
				);
			});
		}

		if(this.props.placeholder) {
			options.unshift(<option key={0}/>);
		}

		console.log(options);

		return (
			<Input {...this.props} ref='target' type='select'>
				{options}
			</Input>
		);
	}
});

module.exports = Select;
