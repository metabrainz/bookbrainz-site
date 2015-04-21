var React = require('react');
var EditForm = React.createFactory(require('../../components/forms/work.jsx'));
var props = JSON.parse(document.getElementById('props').innerHTML);

React.render(EditForm(props), document.getElementById('workForm'));
