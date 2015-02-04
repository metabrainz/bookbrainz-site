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

  self.addAlias = function() {
    self.aliases.push({
      name: self.newName,
      sortName: self.newSortName
    });
  };

  self.removeAlias = function() {
    self.aliases.remove(this);
  };

  self.submitRevision = function() {
    request.post('/publication/create/handler').
    send({
      aliases: self.aliases(),
      publicationTypeId: parseInt(self.publicationTypeId),
      disambiguation: self.disambiguation,
      annotation: self.annotation,
      editId: parseInt(self.editId)
    }).promise().catch(function(err) {
      self.error(err);
    });
  };

  self.page = ko.observable(1);

  self.newName = '';
  self.newSortName = '';

  self.aliases = ko.observableArray();
  self.error = ko.observable();

  self.publicationTypeId = '';
  self.disambiguation = '';
  self.annotation = '';

  self.editId = '';
}

ko.applyBindings(new CreatePublicationViewModel());
