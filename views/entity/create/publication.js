var ko = require('knockout');
var request = require('superagent');
var $ = require('jquery');
require('superagent-bluebird-promise');

function CreatePublicationViewModel() {
	var self = this;

	self.pageAliases = function() {
		self.page(1);
	};

	self.pageData = function() {
		self.page(2);
	};

	self.pageSubmit = function() {
		self.page(3);
	};

	self.submitRevision = function() {
		request.post('/publication/create/handler')
			.send({
				aliases: [{
					name: self.newName,
					sortName: self.newSortName,
					languageId: parseInt(self.languageId),
					languageText: $('#languageSelect :selected').text(),
					dflt: true,
					primary: self.primary
				}],
				publicationTypeId: parseInt(self.publicationTypeId),
				disambiguation: self.disambiguation,
				annotation: self.annotation,
				note: self.revisionNote
			})
			.promise()
			.then(function(revision) {
				// XXX: Eww, eww, eww
				if (!revision.body || !revision.body.entity) {
					window.location.replace('/login');
					return;
				}

				console.log(revision.body.entity.entity_gid);
				window.location.href = '/publication/' + revision.body.entity.entity_gid;
			}).
			catch(function(err) {
				self.error(err);
			});
	};

	self.page = ko.observable(1);

	self.newName = '';
	self.newSortName = '';
	self.languageId = '';
	self.primary = false;

	self.error = ko.observable();

	self.publicationTypeId = '';
	self.disambiguation = '';
	self.annotation = '';

	self.revisionNote = '';
}

ko.applyBindings(new CreatePublicationViewModel());
