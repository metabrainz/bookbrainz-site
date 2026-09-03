BEGIN;

CREATE TABLE IF NOT EXISTS musicbrainz.script (
    id              SERIAL PRIMARY KEY,
    iso_code        CHAR(4) NOT NULL,
    iso_number      CHAR(3) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    frequency       INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE bookbrainz.alias ADD COLUMN script_id INT;
ALTER TABLE bookbrainz.alias ADD FOREIGN KEY (script_id)
    REFERENCES musicbrainz.script (id) DEFERRABLE;

COMMIT;
