var React = require('react');
var ProfileForm = React.createFactory(require('../../components/forms/profile.jsx'));

React.render(ProfileForm(), document.getElementById('profileForm'));
