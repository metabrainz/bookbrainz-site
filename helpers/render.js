var Handlebars = require('handlebars');
var utils = require('./utils');


function renderRelationship(entities, relationship, language) {
  var template = Handlebars.compile(relationship.forward_template);

  var data = {
    'entities': entities.map(function(entity) {
      return '<a href="' + utils.getEntityLink(entity) + '">' +
        entity.aliases.aliases[0].name + '</a>';
    })
  };
  console.log(data);
  console.log(relationship.forward_template);
  return template(data);
}

module.exports = renderRelationship;
