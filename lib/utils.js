var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');

// Returns a Promise which fulfills with an entity with aliases and data.
function getEntityWithAliasesAndData(ws, entity_gid) {
  var entityPromise = request.get(ws + '/entity/' + entity_gid).promise()
  .then(function(entityResponse) {
    return entityResponse.body;
  });

  var aliasesPromise = entityPromise.then(function(entity) {
    return request.get(entity.aliases_uri).promise()
    .then(function(aliasesResponse) {
      return aliasesResponse.body;
    });
  });

  var dataPromise = entityPromise.then(function(entity) {
    return request.get(entity.data_uri).promise()
    .then(function(dataResponse) {
      return dataResponse.body;
    });
  });

  return Promise.join(
    entityPromise, aliasesPromise, dataPromise,
    function(entity, aliases, data) {
      entity.data = data;
      entity.aliases = aliases;
      return entity;
    }
  );
}

module.exports = {
  getEntityWithAliasesAndData: getEntityWithAliasesAndData,
};
