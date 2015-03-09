var express = require('express');
var router = express.Router();
var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');

router.get('/creator/create', function(req, res) {
  // Get the list of publication types
  var ws = req.app.get('webservice');

  var gendersPromise = request.get(ws + '/gender').promise().then(function(genderResponse) {
    return genderResponse.body;
  });

  var creatorTypesPromise = request.get(ws + '/creatorType').promise().then(function(creatorTypesResponse) {
    return creatorTypesResponse.body;
  });

  var languagesPromise = request.get(ws + '/language').promise().then(function(languagesResponse) {
    return languagesResponse.body;
  });

  Promise.join(gendersPromise, creatorTypesPromise, languagesPromise,
  function(genders, creatorTypes, languages) {
    var genderList = genders.objects.sort(function(a, b) {
      return a.id > b.id;
    });

    var alphabeticLanguagesList = languages.objects.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });

    res.render('entity/create/creator', {
      session: req.session,
      genders: genderList,
      languages: alphabeticLanguagesList,
      creatorTypes: creatorTypes
    });
  });
});


router.post('/creator/create/handler', function(req, res) {
  var ws = req.app.get('webservice');

  console.log(req.body);

  if (!req.body.editId) {
    console.log('Make new edit!');
  }

  // If 'new edit' in form, create a new edit.
  var editPromise = request.post(ws + '/edits')
  .send({})
  .set('Authorization', 'Bearer ' + req.session.bearerToken).promise();

  var changes = {
    'entity_gid': [],
    'creator_data': {
      'ended': req.body.ended
    }
  };

  if (req.body.creatorTypeId) {
    changes.creator_data.creator_type_id = req.body.creatorTypeId;
  }

  if (req.body.genderId) {
    changes.creator_data.gender_id = req.body.genderId;
  }

  if (req.body.beginDate) {
    changes.creator_data.begin_date = req.body.beginDate;
  }

  if (req.body.endDate) {
    changes.creator_data.end_date = req.body.endDate;
  }

  if (req.body.disambiguation) {
    changes.disambiguation = req.body.disambiguation;
  }

  if (req.body.annotation) {
    changes.annotation = req.body.annotation;
  }

  changes.aliases = req.body.aliases.map(function(alias) {
    return {
      'name': alias.name,
      'sort_name': alias.sortName,
      'language_id': alias.languageId,
      'primary': alias.primary,
      'default': alias.dflt
    };
  });

  editPromise.then(function(edit) {
    changes.edit_id = edit.body.edit_id;

    request.post(ws + '/revisions')
    .set('Authorization', 'Bearer ' + req.session.bearerToken)
    .send(changes).promise()
    .then(function(revision) {
      res.send(revision.body);
    });
  });
});

module.exports = router;
