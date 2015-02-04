var express = require('express');
var router = express.Router();
var request = require('superagent');
var Promise = require('bluebird');
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

  Promise.join(
    entityPromise, disambiguationPromise, annotationPromise, aliasesPromise,
    dataPromise, function(entity, disambiguation, annotation, aliases, data) {
      console.log(entity.body);
      console.log(data.body);
      res.render('entity/view/publication', {
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

router.get('/publication/:id/edit', function(req, res) {
  res.render('edit/publication', {
    session: req.session,
    gid:req.params.id
  });
});

module.exports = router;
