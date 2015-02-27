var express = require('express');
var router = express.Router();
var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');

/* create publication endpoint */
router.get('/publication/create', function(req, res) {
  var ws = req.app.get('webservice');

  // Get the list of publication types
  var publicationTypesPromise = request.get(ws + '/creatorType').promise()
  .then(function(publicationTypesResponse) {
    return publicationTypesResponse.body;
  });

  var languagesPromise = request.get(ws + '/language').promise()
  .then(function(languagesResponse) {
    return languagesResponse.body;
  });

  Promise.join(publicationTypesPromise, languagesPromise,
  function(publicationTypes, languages) {
    var alphabeticLanguagesList = languages.objects.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });

    res.render('entity/create/creator', {
      session: req.session,
      languages: alphabeticLanguagesList,
      publicationTypes: publicationTypes
    });
  });
});

router.post('/publication/create/handler', function(req, res) {
  var ws = req.app.get('webservice');

  console.log(req.body);

  if (!req.body.editId) {
    console.log('Make new edit!');
  }
  // If 'new edit' in form, create a new edit.
  var editPromise = request.post(ws + '/edits')
  .send({})
  .set('Authorization', 'Bearer ' + req.session.oauth.access_token).promise();

  var changes = {
    'entity_gid': [],
    'publication_data': {
      'publication_type_id': req.body.publicationTypeId
    }
  };

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
    changes.edit_id = edit.body.id;

    request.post(ws + '/revisions')
    .set('Authorization', 'Bearer ' + req.session.oauth.access_token)
    .send(changes).promise()
    .then(function(revision) {
      res.send(revision.body);
    });
  });
});

module.exports = router;
