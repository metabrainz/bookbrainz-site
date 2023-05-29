BEGIN TRANSACTION;

CREATE TYPE bookbrainz.admin_action_type AS ENUM (
	'Change Privileges'
);

COMMIT;

BEGIN TRANSACTION;

CREATE TABLE bookbrainz.admin_log (
    id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    old_privs INT,
    new_privs INT,
    action_type bookbrainz.admin_action_type NOT NULL,
    time TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    note VARCHAR NOT NULL
);

ALTER TABLE bookbrainz.admin_log ADD FOREIGN KEY (user1_id) REFERENCES bookbrainz.editor(id);
ALTER TABLE bookbrainz.admin_log ADD FOREIGN KEY (user2_id) REFERENCES bookbrainz.editor(id);

COMMIT;