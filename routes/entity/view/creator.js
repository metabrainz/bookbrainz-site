var express = require('express');
var router = express.Router();
var view = require('./view');

router.get('/creator/:id', function(req, res) {
	view.renderEntityView(req, res, 'entity/view/creator');
});

module.exports = router;