var ko = require('knockout');


function ViewPublicationViewModel() {
  this.editMode = ko.observable(false);

  this.toggleEditMode = function() {
    this.editMode(!this.editMode());
  };

  this.editAliases = function() {
    if (this.editMode()) {
      $('#myModal').modal('toggle');
    }
  };
}

ko.applyBindings(new ViewPublicationViewModel());
