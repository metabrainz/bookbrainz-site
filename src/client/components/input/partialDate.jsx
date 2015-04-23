var React = require('react');
var Input = require('react-bootstrap').Input;

var ymd_re = /^\d{4}-\d{2}-\d{2}$/;
var ym_re = /^\d{4}-\d{2}$/;
var y_re = /^\d{4}$/;

var PartialDate = React.createClass({
  getValue: function() {
    return this.state.value;
  },
  getInitialState: function() {
    return {
      value: this.props.defaultValue,
      valid: this.validate(this.props.defaultValue),
    };
  },
  validate: function(value) {
    if(!value) {
      return true;
    } else {
      return Boolean(ymd_re.test(value) || ym_re.test(value) ||
                     y_re.test(value));
    }
  },
  handleChange: function() {
    var input = this.refs.input.getValue().trim();
    if(input.length > 10) {
      return;
    }

    this.setState({
        value: input,
        valid: this.validate(input),
    });
  },
  valid: function() {
    return this.state.valid;
  },
  validationState: function() {
    var validationClass = null;

    if(this.state.value) {
      validationClass = this.state.valid ? 'success' : 'error';
    }

    return validationClass;
  },
  render: function() {
    return (
      <Input
        type='text'
        value={this.state.value}
        placeholder={this.props.placeholder}
        label={this.props.label}
        help={this.props.help}
        bsStyle={this.validationState()}
        ref='input'
        groupClassName={this.props.groupClassName}
        wrapperClassName={this.props.wrapperClassName}
        labelClassName={this.props.labelClassName}
        onChange={this.handleChange} />
    );
  }
});


module.exports = PartialDate;
