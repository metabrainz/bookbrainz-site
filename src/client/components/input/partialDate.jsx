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
      value: '',
      valid: true,
    };
  },
  handleChange: function() {
    var input = this.refs.input.getValue().trim();
    if(input.length > 10) {
      return;
    }

    if(!input) {
      this.setState({
          value: input,
          valid: true,
      });
    } else {
      this.setState({
          value: input,
          valid: (ymd_re.test(input) || ym_re.test(input) || y_re.test(input)),
      });
    }
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
