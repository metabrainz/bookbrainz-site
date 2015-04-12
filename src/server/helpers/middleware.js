var CreatorType = require('../data/properties/creator-type');
var Gender = require('../data/properties/gender');
var Language = require('../data/properties/language');

var middleware = {};

middleware.loadCreatorTypes = function(req, res, next) {
	CreatorType.find()
		.then(function(creatorTypes) {
			res.locals.creatorTypes = creatorTypes;

			next();
		})
		.catch(next);
};

middleware.loadGenders = function(req, res, next) {
	Gender.find()
		.then(function(genders) {
			res.locals.genders = genders.sort(function(a, b) {
				return a.id > b.id;
			});

			next();
		})
		.catch(next);
};

middleware.loadLanguages = function(req, res, next) {
	Language.find()
		.then(function(languages) {
			res.locals.languages = languages.sort(function(a, b) {
				if (a.frequency != b.frequency)
					return b.frequency - a.frequency;

				return a.name.localeCompare(b.name);
			});

			next();
		})
		.catch(next);
};

module.exports = middleware;
