var Handlebars = require('handlebars');

function getEntityLink(entity) {
  if (entity.data.publication_data) {
    return '/publication/' + entity.entity_gid;
  } else if (entity.data.creator_data) {
    return '/creator/' + entity.entity_gid;
  }
}

function renderRelationship(entities, relationship, language) {
  var template = Handlebars.compile(relationship.forward_template);

  var data = {
    'entities': entities.map(function(entity) {
      return '<a href="' + getEntityLink(entity) + '">' +
        entity.aliases.aliases[0].name + '</a>';
    })
  };
  console.log(data);
  console.log(relationship.forward_template);
  return template(data);
}

module.exports = renderRelationship;
