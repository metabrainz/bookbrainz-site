var ko = require('knockout');
var request = require('superagent');
var $ = require('jquery');
var renderRelationship = require('../../lib/render');
var Promise = require('bluebird');
var utils = require('../../lib/utils');
require('superagent-bluebird-promise');

var ws = 'http://localhost:5000/ws';

function RelationshipEditor(relationships, relationshipTypes) {
  var self = this;

  self.relationshipTypes = relationshipTypes.objects;
  console.log(relationshipTypes);

  self.currentRelationshipType = ko.observable(self.relationshipTypes[0]);

  self.entityGids = ko.observableArray([
    {gid: ko.observable('0f630b21-e423-4d42-8f26-abdd03cae31e'), disabled: ko.observable(true)},
    {gid: ko.observable(), disabled: ko.observable(false)}
  ]);

  self.entities = ko.observableArray();
  ko.computed(function() {
    var temp = self.entityGids().map(function(gid) {
      return utils.getEntityWithAliasesAndData(ws, gid.gid());
    });

    return Promise.all(temp).then(function(entities) {
      self.entities(entities);
    }).catch(function(err) {});
  }).extend({rateLimit: {timeout: 500, method: 'notifyWhenChangesStop'}});

  self.renderedRelationship = ko.computed(function() {
    var temp = renderRelationship(self.entities(), self.currentRelationshipType(), 1);
    return temp;
  });

  self.swap = function(index) {
    console.log(index);
    var temp = {
      gid: self.entityGids()[index + 1].gid(),
      disabled: self.entityGids()[index + 1].disabled()
    };

    self.entityGids()[index + 1].gid(self.entityGids()[index].gid());
    self.entityGids()[index + 1].disabled(self.entityGids()[index].disabled());

    self.entityGids()[index].gid(temp.gid);
    self.entityGids()[index].disabled(temp.disabled);
  };

  this.lastEntity = function(index) {
    return index === (self.entityGids().length - 1);
  };

  this.gidComplete = function(gid) {
    return gid.length == 36;
  };

  self.existingRelationships = ko.observableArray();
  self.existingRelationships().forEach(function(relationship) {
    relationship.entities.forEach(function(entity, entityIndex) {
      getEntityWithAliasesAndData(ws, entity.gid)
      .then(function(fetchedEntity) {
        relationship.entities[entityIndex] = fetchedEntity;
        console.log(relationship);
        relationship.rendered = renderRelationship(relationship.entities, relationship.type, 1);
      });
    });
  });

  self.addedRelationships = ko.observableArray();
  self.processRelationship = function() {
    self.addedRelationships.push({
      type: self.currentRelationshipType(),
      rendered: self.renderedRelationship(),
      entities: self.entities()
    });
  };

  self.removeRelationship = function(test) {
    console.log(test);
    self.addedRelationships.remove(test);
  };

  self.relationshipComplete = ko.computed(function(test) {
    return self.entities().length > 0;
  });

  self.submit = function() {
    request.post('/relationship/create/handler').
    send(self.addedRelationships().map(function(relationship) {
      return {
        relationship_id: [],
        relationship_type_id: relationship.type.id,
        entities: relationship.entities.map(function(entity, index) {
          return {
            gid: entity.gid,
            position: index
          };
        })
      };
    })).promise().then(function(revision) {
      console.log(revision.body.entity.gid);
      window.location.href = '/creator/' + revision.body.entity.gid;
    }).catch(function(err) {
      self.error(err);
    });
  };
}

var entityGid = $('#entityContainer').attr('data-entity-gid');

var relationshipsPromise = request.get(ws + '/entity/' + entityGid + '/relationships').promise()
.then(function(relationshipsResponse) {
  return relationshipsResponse.body;
});

var relationshipTypesPromise = request.get(ws + '/relationshipType').promise()
.then(function(relationshipTypesResponse) {
  return relationshipTypesResponse.body;
});

Promise.join(relationshipsPromise, relationshipTypesPromise,
function(relationships, relationshipTypes) {
  ko.applyBindings(new RelationshipEditor(relationships, relationshipTypes));
}).catch(function(err) {
  console.log(err.stack);
});
