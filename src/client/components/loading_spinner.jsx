var React = require('react');

var LoadingSpinner = React.createClass({
    render: function() {
      return (
        <div className="loading-background">
          <span className="fa fa-circle-o-notch fa-spin fa-2x loading-spinner"></span>
        </div>
      );
    }
});

module.exports = LoadingSpinner;
