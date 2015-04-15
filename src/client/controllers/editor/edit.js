var React = require('react');
var ProfileForm = React.createFactory(require('../../components/forms/profile.jsx'));
var props = JSON.parse(document.getElementById('props').innerHTML);

React.render(ProfileForm(props), document.getElementById('profileForm'));
