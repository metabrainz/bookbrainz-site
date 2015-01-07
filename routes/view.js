var express = require('express');
var router = express.Router();
var request = require('superagent');
var Promise = require("bluebird");
require('superagent-bluebird-promise');

/* GET users listing. */
router.get('/publication/:id', function(req, res) {
  var ws = req.app.get('webservice');
  var entityPromise = request.get(ws + '/entity/' + req.params.id).promise();

  var disambiguationPromise = entityPromise.then(function(entity) {
    console.log(entity.body.disambiguation_uri);
    return request.get(entity.body.disambiguation_uri).promise();
  });

  var aliasesPromise = entityPromise.then(function(entity) {
    console.log(entity.body.aliases_uri);
    return request.get(entity.body.aliases_uri).promise();
  });

  var annotationPromise = entityPromise.then(function(entity) {
    return request.get(entity.body.annotation_uri).promise();
  });

  var dataPromise = entityPromise.then(function(entity) {
    return request.get(entity.body.data_uri).promise();
  });

  Promise.join(entityPromise, disambiguationPromise, annotationPromise, aliasesPromise, dataPromise,
    function(entity, disambiguation, annotation, aliases, data) {
      console.log(entity.body);
      console.log(data.body);
      res.render('view/publication', {
        session: req.session,
        entity:entity.body,
        annotation:annotation.body,
        data:data.body,
        disambiguation:disambiguation.body,
        aliases:aliases.body
      });
    }
  );
});

router.post('/login/handler', function(req, res) {
  // Authenticate
  request.post('http://localhost:5000/oauth/token')
  .set('Content-Type', 'application/x-www-form-urlencoded')
  .send({
    'client_id': 'f8accd51-33d2-4d9b-a2c1-c01a76a4f096',
    'username': req.body.username,
    'password': 'abc',
    'grant_type': 'password'
  }).promise().then(function(oauth) {
    return request.get('http://localhost:5000/user/' + oauth.body.user_id)
    .promise().then(function(user) {
      req.session.oauth = oauth.body;
      req.session.user = user.body;
      res.redirect(303, '/');
    });
  }).catch(function(err) {
    var error = err.res.body.error_description;
    res.redirect(303, '/login?error='+error);
  });
});

module.exports = router;
