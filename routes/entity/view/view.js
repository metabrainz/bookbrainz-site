var Promise = require('bluebird');
var request = require('superagent'); require('superagent-bluebird-promise');
var utils = rootRequire('lib/utils');
var renderRelationship = rootRequire('lib/render');

function renderEntityView(req, res, template) {
  var ws = req.app.get('webservice');

  var completeEntityPromise = utils.getEntity(ws, req.params.id, {
    data: true,
    aliases: true,
    disambiguation: true,
    annotation: true,
    relationships: true
  });

  completeEntityPromise.then(function(entity) {
    relationshipEntities = {};
    relationshipEntities[entity.gid] = entity;

    entity.relationships.objects.forEach(function(relationship) {
      relationship.entities.forEach(function(entry) {
        if (!relationshipEntities[entry.entity.gid]) {
          relationshipEntities[entry.entity.gid] = utils.getEntity(
            ws, entry.entity.gid, {data: true, aliases: true}
          );
        }
        entry.entity = relationshipEntities[entry.entity.gid];
      });
    });

    Promise.props(relationshipEntities).then(function(fetchedEntities) {
      // Render relationships
      entity.relationships.objects.forEach(function(relationship) {
        relationship.entities.sort(function(a, b) {
          return a.position - b.position;
        });

        var entities = relationship.entities.map(function(entry) {
          return entry.entity;
        });

        relationship.rendered = renderRelationship(
          entities, relationship.relationship_type, 1
        );
      });

      res.render(template, {
        session: req.session,
        entity: entity,
      });
    });
  });
}

module.exports = {
  renderEntityView: renderEntityView
};
