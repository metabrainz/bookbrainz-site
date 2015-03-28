var express = require('express'),
    router = express.Router(),
    User = rootRequire('data/user'),
    UserType = rootRequire('data/properties/user-type');

router.get('/', function(req, res) {
	var error = req.session.error;
	delete req.session.error;

	res.render('register', {
		error: error
	});
});

router.post('/handler', function(req, res, next) {
	if (!req.body.password) {
		req.session.error = 'No password set';
		res.redirect(303, '/register');

		return;
	}

	if (req.body.password != req.body.password2) {
		req.session.error = 'Passwords did not match';
		res.redirect(303, '/register');

		return;
	}

	// This function should post a new user to the /user endpoint of the ws.
	UserType.find()
		.then(function(results) {
			var editorType;

			var hasEditorType = !results.every(function(userType) {
				if (userType.label == 'Editor') {
					editorType = userType;
					return false;
				}

				return true;
			});

			if (!hasEditorType)
				throw new Error('Editor user type not found');

			return User.create({
				name: req.body.username,
				email: req.body.email,
				password: req.body.password,
				user_type: {
					user_type_id: editorType.id
				}
			});
		})
		.then(function() {
			res.redirect(303, '/');
		})
		.catch(function(err) {
			next(err);
		});
});

module.exports = router;
