var express = require('express'),
    router = express.Router(),
    User = rootRequire('data/user'),
    UserType = rootRequire('data/properties/user-type');

router.get('/register', function(req, res) {
	res.render('register', {
		error: req.query.error
	});
});

router.post('/register/handler', function(req, res, next) {
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
