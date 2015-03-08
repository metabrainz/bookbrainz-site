var express = require('express');
var router = express.Router();
var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');

/* GET home page. */
router.get('/', function(req, res) {
  var ws = req.app.get('webservice');
  var entityPromise = request.get(ws + '/entity?limit=9').promise();

  entityPromise.then(function(entities) {
    var extraData = entities.body.objects.map(function(entity) {
      entity.data = request.get(entity.data_uri).promise();
      entity.aliases = request.get(entity.aliases_uri).promise();
      return Promise.props(entity);
    });

    Promise.all(extraData).then(function(entitiesWithData) {
      res.render('index', {
        title: 'BookBrainz',
        session: req.session,
        recent: entitiesWithData
      });
    });
  });
});

router.get('/about', function(req, res) {
  res.render('about', {
    session: req.session,
    title: 'BookBrainz :: About',
  });
});

router.get('/contribute', function(req, res) {
  res.render('contribute', {
    session: req.session,
    title: 'BookBrainz :: Contribute',
  });
});

router.get('/develop', function(req, res) {
  res.render('develop', {
    session: req.session,
    title: 'BookBrainz :: Develop',
  });
});

router.get('/getStarted', function(req, res) {
  res.render('getStarted', {
    session: req.session,
    title: 'BookBrainz :: Get Started',
  });
});

module.exports = router;
