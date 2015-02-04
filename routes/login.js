var express = require('express');
var router = express.Router();
var request = require('superagent');
require('superagent-bluebird-promise');

/* GET users listing. */
router.get('/login', function(req, res) {
  res.render('login', {session: req.session, error: req.query.error});
});

/* GET users listing. */
router.get('/logout', function(req, res) {
  delete req.session.oauth;
  delete req.session.user;
  res.redirect(303, '/');
});

router.post('/login/handler', function(req, res) {
  // Authenticate
  var ws = req.app.get('webservice');
  request.post(ws + '/oauth/token')
  .set('Content-Type', 'application/x-www-form-urlencoded')
  .send({
    'client_id': 'f8accd51-33d2-4d9b-a2c1-c01a76a4f096',
    'username': req.body.username,
    'password': 'abc',
    'grant_type': 'password'
  }).promise().then(function(oauth) {
    return request.get(ws + '/user/' + oauth.body.user_id)
      .promise().then(function(user) {
        req.session.oauth = oauth.body;
        req.session.user = user.body;
        res.redirect(303, '/');
      });
  }).catch(function(err) {
    console.log(err);
    var error = err.res.body.error_description;
    res.redirect(303, '/login?error=' + error);
  });
});

module.exports = router;
