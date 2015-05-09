var Handlebars = require('handlebars');
var utils = require('./utils');

function renderRelationship(entities, relationship, language) {
	var template = Handlebars.compile(relationship.template);

	var data = {
		entities: entities.map(function(entity) {
			var name = entity.default_alias ? entity.default_alias.name : '(unnamed)';
			return '<a href="' + utils.getEntityLink(entity) + '">' +
				name + '</a>';
		})
	};

	return template(data);
}

module.exports = renderRelationship;
