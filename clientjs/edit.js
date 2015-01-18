var ko = require('knockout');

function CreatePublicationViewModel() {
  this.publicationType = ko.observable();

  this.isISBNVisible = ko.computed(function() {
    return this.publicationType() == 1;
  }, this);

  this.isISSNVisible = ko.computed(function() {
    return this.publicationType() == 2;
  }, this);
}

ko.applyBindings(new CreatePublicationViewModel());
