var express = require('express'),
    router = express.Router(),
    User = rootRequire('data/user');

router.get('/editor/:id', function(req, res) {
	var userPromise;

	if (req.params.id == req.user.id)
		userPromise = User.getCurrent(req.session.bearerToken);
	else
		userPromise = User.findOne(req.params.id);

	userPromise.then(function(editor) {
		res.render('editor/editor', {
			editor: editor
		});
	});
});

module.exports = router;
