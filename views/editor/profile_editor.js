var ko = require('knockout');
var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');

var ws = 'http://waveplot.net:5000/ws';
var userId = $('#userContainer').attr('data-user-id');


function ProfileEditor(user) {
	var self = this;

	self.bio = user.bio;
	self.name = user.name;

	self.submit = function() {
		request.post('/editor/edit/handler')
		.send({
			id: user.user_id,
			bio: self.bio,
			name: self.name
		}).promise()
		.then(function(user) {
			window.location.href = '/editor/' + user.body.user_id;
		}).
		catch(function(err) {
			console.log(err);
			self.error(err);
		});
	};

	self.error = ko.observable();
}

// Get User - (bio, name)
var userPromise = request.get(ws + '/user/' + userId).promise()
	.then(function(userResponse) {
		return userResponse.body;
	});

userPromise.then(function(user) {
		ko.applyBindings(new ProfileEditor(user));
	}).
catch(function(err) {
	console.log(err.stack);
});
