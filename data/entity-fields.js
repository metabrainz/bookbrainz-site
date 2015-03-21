var Alias = rootRequire('data/properties/alias');

var entityFields = {
	bbid: { type: 'uuid', map: 'entity_gid' },
	aliases: { type: 'ref', model: Alias, many: true, map: 'aliases_uri' },
	default_alias_id: { type: 'number' },
	last_updated: { type: 'date' },
	master_revision_id: { type: 'number' }
};

module.exports = entityFields;
