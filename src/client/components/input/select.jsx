var React = require('react');
var Input = require('react-bootstrap').Input;

if (typeof window !== 'undefined') {
	window.$ = require('jquery');
	require('select2');
}

var Select = React.createClass({
	getValue: function() {
		return this.refs.input.getValue()
	},
	handleChange: function() {
		if (this.props.onChange) {
			this.props.onChange();
		}
	},
	componentDidMount: function() {
		var select2Options = this.props.select2Options || {};

		/* Allow consistent behavior with other bootstrap components, but don't
		 * clobber select2 options otherwise. */
		if (this.props.placeholder) {
			select2Options.placeholder = this.props.placeholder;
		}

		$(this.refs.input.getInputDOMNode()).select2();
	},
	render: function() {
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

		if (this.props.noDefault) {
			options.unshift(<option key='0'></option>);
		}

		return (
			<Input
				type='select'
				placeholder={this.props.placeholder}
				value={this.props.value}
				defaultValue={this.props.defaultValue}
				label={this.props.label}
				help={this.props.help}
				bsStyle={this.props.bsStyle}
				ref='input'
				groupClassName={this.props.groupClassName}
				wrapperClassName={this.props.wrapperClassName}
				labelClassName={this.props.labelClassName}
				multiple={this.props.multiple}
				onChange={this.handleChange}>
				{options}
			</Input>
		);
	}
});

module.exports = Select;
