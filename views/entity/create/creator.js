var ko = require('knockout');
var request = require('superagent');
var $ = require('jquery');
require('superagent-bluebird-promise');

function CreateCreatorViewModel() {
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

	self.addAlias = function() {
		self.aliases.push({
			name: self.newName,
			sortName: self.newSortName,
			languageId: parseInt(self.languageId),
			languageText: $('#languageSelect :selected').text(),
			dflt: self.dflt(),
			primary: self.primary()
		});

		if (self.dflt()) {
			self.dflt(false);
			self.defaultSet(true);
		}
	};

	self.defaultSet = ko.observable(false);

	self.removeAlias = function() {
		if (this.dflt) {
			self.defaultSet(false);
		}

		self.aliases.remove(this);
	};

	self.submitRevision = function() {
		request.post('/creator/create/handler').
		send({
			aliases: self.aliases(),
			creatorTypeId: parseInt(self.creatorTypeId),
			genderId: parseInt(self.genderId),
			beginDate: self.beginDate,
			endDate: self.endDate,
			ended: self.ended,
			disambiguation: self.disambiguation,
			annotation: self.annotation,
			editId: parseInt(self.editId)
		}).promise().then(function(revision) {
			console.log(revision.body.entity.entity_gid);
			window.location.href = '/creator/' + revision.body.entity.entity_gid;
		}).
		catch(function(err) {
			self.error(err);
		});
	};

	self.page = ko.observable(1);

	self.newName = '';
	self.newSortName = '';
	self.languageId = '';
	self.dflt = ko.observable(false);
	self.primary = ko.observable(false);

	self.aliases = ko.observableArray();
	self.error = ko.observable();

	self.genderId = null;
	self.creatorTypeId = null;
	self.disambiguation = '';
	self.annotation = '';

	self.beginDate = '';
	self.endDate = '';

	self.editId = '';
	self.ended = ko.observable(false);
}

ko.applyBindings(new CreateCreatorViewModel());
