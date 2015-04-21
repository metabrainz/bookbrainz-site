var React = require('react');
var EditForm = React.createFactory(require('../components/forms/relationship.jsx'));
var props = JSON.parse(document.getElementById('props').innerHTML);

React.render(EditForm(props), document.getElementById('relationshipForm'));
