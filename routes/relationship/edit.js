var express = require('express');
var router = express.Router();
var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');

function relationshipEditor(req, res) {
  res.render('relationship/edit', {
    session: req.session,
    entityGid: req.params.id
  });
}

router.post('/relationship/create/handler', function(req, res) {
  req.body.forEach(function(relationship) {
    console.log(relationship.entities);
  });
});

router.get('/publication/:id/relationships', relationshipEditor);
router.get('/creator/:id/relationships', relationshipEditor);

module.exports = router;
