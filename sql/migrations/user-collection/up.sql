BEGIN;

CREATE TABLE IF NOT EXISTS bookbrainz.user_collection (
	id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
	owner_id INT NOT NULL,
	name VARCHAR(80) NOT NULL CHECK (name <> ''),
	description TEXT NOT NULL DEFAULT '',
	entity_type bookbrainz.entity_type NOT NULL,
	public BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	last_modified TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);
ALTER TABLE bookbrainz.user_collection ADD FOREIGN KEY (owner_id) REFERENCES bookbrainz.editor (id);

CREATE TABLE IF NOT EXISTS bookbrainz.user_collection_item (
	collection_id UUID,
	bbid UUID,
	added_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);
ALTER TABLE bookbrainz.user_collection_item ADD FOREIGN KEY (collection_id) REFERENCES bookbrainz.user_collection (id);
ALTER TABLE bookbrainz.user_collection_item ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE IF NOT EXISTS bookbrainz.user_collection_collaborator (
	collection_id UUID,
	editor_id INT
);
ALTER TABLE bookbrainz.user_collection_collaborator ADD FOREIGN KEY (collection_id) REFERENCES bookbrainz.user_collection (id);
ALTER TABLE bookbrainz.user_collection_collaborator ADD FOREIGN KEY (editor_id) REFERENCES bookbrainz.editor (id);

COMMIT;
