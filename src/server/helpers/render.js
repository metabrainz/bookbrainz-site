var Handlebars = require('handlebars');
var utils = require('./utils');


function renderRelationship(entities, relationship, language) {
	var template = Handlebars.compile(relationship.template);

	var data = {
		entities: entities.map(function(entity) {
			return '<a href="' + utils.getEntityLink(entity) + '">' +
				entity.default_alias.name + '</a>';
		})
	};

	return template(data);
}

module.exports = renderRelationship;
