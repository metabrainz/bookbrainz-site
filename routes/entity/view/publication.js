var express = require('express');
var router = express.Router();
var view = require('./view');

router.get('/publication/:id', function(req, res) {
	view.renderEntityView(req, res, 'entity/view/publication');
});

module.exports = router;