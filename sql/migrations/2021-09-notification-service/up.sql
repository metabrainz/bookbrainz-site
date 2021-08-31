BEGIN;

CREATE TABLE IF NOT EXISTS bookbrainz.notification (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    subscriber_id INT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    notification_text TEXT NOT NULL CHECK (notification_text <> ''),
    notification_redirect_link TEXT NOT NULL CHECK (notification_redirect_link <> ''),
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);
ALTER TABLE bookbrainz.notification ADD FOREIGN KEY (subscriber_id) REFERENCES  bookbrainz.editor (id);

CREATE TABLE bookbrainz.entity_subscription (
    bbid UUID,
    subscriber_id INT
);
ALTER TABLE bookbrainz.entity_subscription ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);
ALTER TABLE bookbrainz.entity_subscription ADD FOREIGN KEY (subscriber_id) REFERENCES bookbrainz.editor (id);


CREATE TABLE bookbrainz.collection_subscription (
    collection_id UUID,
    subscriber_id INT
);
ALTER TABLE bookbrainz.collection_subscription ADD FOREIGN KEY (collection_id) REFERENCES bookbrainz.user_collection (id);
ALTER TABLE bookbrainz.collection_subscription ADD FOREIGN KEY (subscriber_id) REFERENCES bookbrainz.editor (id);

COMMIT;
