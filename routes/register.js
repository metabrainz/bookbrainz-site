var express = require('express');
var router = express.Router();

router.get('/register', function(req, res) {
  res.render('register', {session: req.session, error: req.query.error});
});

router.post('/register/handler', function(req, res) {
  // This function should post a new user to the /user endpoint of the ws.
  var ws = req.app.get('webservice');

  // FIXME: This hardcodes the user type, assuming editor will be #1 - not
  // very good
  request.post(ws + '/user').send({
    'name': req.body.username,
    'email': req.body.email,
    'user_type_id': 1
  }).promise()
  .then(function() {
    res.redirect(303, '/');
  });
});

module.exports = router;
