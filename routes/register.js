var express = require('express');
var router = express.Router();

router.get('/register', function(req, res) {
  res.render('register', {session: req.session, error: req.query.error});
});

module.exports = router;
