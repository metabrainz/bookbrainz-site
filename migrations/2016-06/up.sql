BEGIN;

CREATE TABLE bookbrainz.title_type (
    id SERIAL PRIMARY KEY,
    title VARCHAR(40) NOT NULL CHECK (title <> ''),
    description TEXT NOT NULL CHECK (description <> '')
);

CREATE TABLE bookbrainz.title_unlock (
    id SERIAL PRIMARY KEY,
    editor_id INT NOT NULL,
    title_id INT NOT NULL,
    unlocked_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);
ALTER TABLE bookbrainz.title_unlock ADD FOREIGN KEY (editor_id) REFERENCES bookbrainz.editor (id);
ALTER TABLE bookbrainz.title_unlock ADD FOREIGN KEY (title_id) REFERENCES bookbrainz.title_type (id);

CREATE TABLE bookbrainz.achievement_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL CHECK (name <> ''),
    description TEXT NOT NULL CHECK (description <> ''),
    badge_url VARCHAR(2000)
);
CREATE TABLE bookbrainz.achievement_unlock (
    id SERIAL PRIMARY KEY,
    editor_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	profile_rank SMALLINT DEFAULT NULL
);
ALTER TABLE bookbrainz.achievement_unlock ADD FOREIGN KEY (editor_id) REFERENCES bookbrainz.editor (id);
ALTER TABLE bookbrainz.achievement_unlock ADD FOREIGN KEY (achievement_id) REFERENCES bookbrainz.achievement_type (id);

ALTER TABLE bookbrainz.editor
	ADD COLUMN title_unlock_id INT DEFAULT NULL;

ALTER TABLE bookbrainz.editor ADD FOREIGN KEY (title_unlock_id) REFERENCES bookbrainz.title_unlock (id);

COMMIT;
