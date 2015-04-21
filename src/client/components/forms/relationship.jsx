var React = require('react');

var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Select = require('../input/select.jsx');
var LoadingSpinner = require('../loading_spinner.jsx');
var UUID = require('../input/uuid.jsx');
var extend = require('util')._extend;
var Promise = require('bluebird');

var request = require('superagent');
require('superagent-bluebird-promise');

var renderRelationship = require('../../../server/helpers/render.js');
var utils = require('../../../server/helpers/utils.js');


module.exports = React.createClass({
  getInitialState: function() {
    var targetEntity = this.props.targetEntity;
    targetEntity.key = 1;
    targetEntity.entity_gid = targetEntity.bbid;

    loadedEntities = {};
    loadedEntities[targetEntity.bbid] = targetEntity;
    return {
      targetEntity: targetEntity,
      loadedEntities: loadedEntities,
      displayEntities: [targetEntity, {key: 2}],
      selectedRelationship: null,
      addedRelationships: [],
      addedRelationshipsSpawned: 0
    }
  },
  fetchEntity: function(uuid) {
    // This should be modified to use bbws if the config can be separated from
    // that.
    return request.get(this.props.wsUrl + '/entity/' + uuid)
  	.accept('application/json')
    .promise()
    .then(function(response) {
      return response.body;
    })
    .then(function(entity) {
      entity.bbid = entity.entity_gid;
      return request.get(entity.aliases_uri)
      .accept('application/json')
      .promise()
      .then(function(response) {
        return response.body;
      })
      .then(function(aliases) {
        entity.aliases = aliases.objects;
        return entity;
      });
    });
  },
  handleSubmit: function(e) {
    var self = this;
    e.preventDefault();

    request.post('./relationships/handler')
		.send(this.state.addedRelationships.map(function(relationship) {
			return {
				id: [],
				relationship_type: {
					relationship_type_id: relationship.type.id
				},
				entities: relationship.entities.map(function(entity, index) {
					return {
						entity_gid: entity.bbid,
						position: index
					};
				})
			};
		}))
    .promise()
    .then(function(revision) {
			window.location.href = utils.getEntityLink(self.state.targetEntity);
		});
  },
  handleAdd: function(e) {
    var addedRelationships = this.state.addedRelationships.slice();

    addedRelationships.push({
			type: this.state.selectedRelationship,
			entities: this.state.displayEntities,
      key: addedRelationshipsSpawned
		});

    addedRelationshipsSpawned++;

    this.setState({addedRelationships: addedRelationships});
  },
  handleSwap: function(i, e) {
    var displayEntities = this.state.displayEntities.slice();
    displayEntities[i] = this.state.displayEntities[i+1];
    displayEntities[i+1] = this.state.displayEntities[i];

    this.setState({displayEntities: displayEntities});
  },
  setDisplayEntity: function(i, entity) {
    entity.key = this.state.displayEntities[i].key;

    var displayEntities = this.state.displayEntities.slice();
    displayEntities[i] = entity;

    this.setState({displayEntities: displayEntities});
  },
  addLoadedEntity: function(entity) {
    var loadedEntities = extend({}, this.state.loadedEntities);
    loadedEntities[entity.bbid] = entity;

    this.setState({loadedEntities: loadedEntities});
  },
  removeRelationship: function(i) {
    var addedRelationships = this.state.addedRelationships.slice();

    addedRelationships.splice(i, 1);

    this.setState({addedRelationships: addedRelationships});
  },
  handleUUIDChange: function(i, e) {
    var self = this;
    var bbid = this.refs[i].getValue();
    if(this.refs[i].valid() && bbid !== this.state.targetEntity.bbid) {
      if(self.state.loadedEntities[bbid]) {
        self.setDisplayEntity(i, loadedEntities[bbid]);
      } else {
        this.fetchEntity(bbid)
        .then(function(entity){
          self.addLoadedEntity(entity);
          self.setDisplayEntity(i, entity);
        });
      }
    } else {
      self.setDisplayEntity(i, {});
    }
  },
  handleRelationshipChange: function(e) {
    var relationshipId = this.refs.relationship.getValue();
    var selectedRelationship = this.props.relationshipTypes.filter(function(relationship) {
      return relationship.id == relationshipId;
    });

    if(selectedRelationship.length !== 0) {
      this.setState({selectedRelationship: selectedRelationship[0]});
    } else {
      this.setState({selectedRelationship: null});
    }
  },
  render: function() {
    var self = this;

    if (this.state.waiting) {
			var loadingElement = <LoadingSpinner />;
		}

    var renderedEntities = this.state.displayEntities.map(function(entity, i) {
      return (
        <div className="form-group" key={entity.key}>
          <UUID
            ref={i}
            label={"Entity " + (i+1)}
            labelClassName="col-md-4"
            wrapperClassName="col-md-4"
            defaultValue={entity ? entity.bbid : null}
            disabled={entity == self.state.targetEntity}
            onChange={self.handleUUIDChange.bind(null, i)}
            standalone
            />
          <div className="col-md-1">
            <Button
              bsStyle="primary"
              className={(i === (self.state.displayEntities.length - 1)) ? "hidden" : null}
              block
              onClick={self.handleSwap.bind(null, i)}>
              <span className="fa fa-exchange fa-rotate-90"/>
              <span className="sr-only">Swap Entities</span>
            </Button>
          </div>
        </div>
      );
    });

    if(this.state.selectedRelationship) {
      var relationshipDescription = <Input type='static' wrapperClassName="col-md-4 col-md-offset-4" value={this.state.selectedRelationship.description} />;
    }

    var allEntitiesLoaded = this.state.displayEntities.every(function(entity) {
      return Boolean(entity.bbid);
    });

    // This could easily be a React component, and should be changed to
    // that at some point soon.
    if(allEntitiesLoaded && this.state.selectedRelationship) {
      var renderedRelationship = {
        __html: renderRelationship(this.state.displayEntities, this.state.selectedRelationship, null)
      };
      var addValid = true;
    }

    var relationshipEntry = (
      <div>
        <Select
          label='Type'
          labelAttribute='label'
          idAttribute='id'
          ref='relationship'
          noDefault
          wrapperClassName="col-md-4"
          labelClassName="col-md-4"
          options={this.props.relationshipTypes}
          onChange={this.handleRelationshipChange}/>

        {relationshipDescription}

        {renderedEntities}

        <div className="text-center">
          <p dangerouslySetInnerHTML={renderedRelationship} />
        </div>
        <div className="row">
          <div className="col-md-4 col-md-offset-4">
            <Button
              disabled={!addValid}
              title="Add Relationship"
              bsStyle="success"
              block
              onClick={this.handleAdd}
              >
              <span className="fa fa-plus"/>
              <span className="sr-only">Add Relationship</span>
            </Button>
          </div>
        </div>
      </div>
    );

    var addedRelationships = this.state.addedRelationships.map(function(relationship, i) {
      var renderedRelationship = {
        __html: renderRelationship(relationship.entities, relationship.type, null)
      };
      return (
        <div className="row" key={relationship.key}>
          <div className="col-md-10" dangerouslySetInnerHTML={renderedRelationship} />
          <div className="col-md-2">
            <Button
              bsStyle="danger"
              block
              onClick={self.removeRelationship.bind(null, i)}>
              <span className="fa fa-minus"/>
              <span className="sr-only">Remove Relationship</span>
            </Button>
          </div>
        </div>
      );
    });

    return (
      <div>
        {loadingElement}
        <h2>Add Relationship</h2>
        <div className="row">
          <div className="form-horizontal">
            {relationshipEntry}
          </div>
        </div>
        <hr/>
        <h2>Current Relationships</h2>
        {addedRelationships}
        <hr/>
        <div className="row">
          <div className="col-md-4 col-md-offset-4">
            <Input
              bsStyle="success" block type='submit' value='Submit!' onClick={this.handleSubmit} />
          </div>
        </div>
      </div>
    );
  }
});
