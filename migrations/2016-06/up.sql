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

INSERT INTO bookbrainz.achievement_type ("name", "description", "badge_url") VALUES
	('Revisionist I', 'Perform one revision', '/images/revisionistI.svg'),
	('Revisionist II', 'Perform 50 revisions', '/images/revisionistII.svg'),
	('Revisionist III', 'Perform 250 revisions', '/images/revisionistIII.svg'),
	('Creator Creator I', 'Create one creator', '/images/creatorcreatorI.svg'),
	('Creator Creator II', 'Create 10 creators', '/images/creatorcreatorII.svg'),
	('Creator Creator III', 'Create 100 creators', '/images/creatorcreatorIII.svg'),
	('Publisher I', 'Create one publication', '/images/publisherI.svg'),
	('Publisher II', 'Create 10 publications', '/images/publisherII.svg'),
	('Publisher III', 'Create 100 publications', '/images/publisherIII.svg'),
	('Sprinter', 'Create 10 revisions in an hour', '/images/sprinter.svg'),
	('Fun Runner', 'Create a revision every day for a week', '/images/funrunner.svg'),
	('Marathoner', 'Create a revision a day for 30 days', '/images/marathoner.svg'),
	('Time Traveller', 'Create an edition before it is released', '/images/timetraveller.svg'),
	('Hot Off the Press', 'Create an edition within a week of its release', '/images/hotoffthepress.svg'),
	('Publisher Creator I', 'Create one publisher', '/images/revisionistI.svg'),
	('Publisher Creator II', 'Create 10 publishers', '/images/revisionistI.svg'),
	('Publisher Creator III', 'Create 100 publishers', '/images/revisionistI.svg'),
	('Limited Edition I', 'Create one edition', '/images/revisionistI.svg'),
	('Limited Edition II', 'Create 10 editions', '/images/revisionistI.svg'),
	('Limited Edition III', 'Create 100 editions', '/images/revisionistI.svg'),
	('Worker Bee I', 'Create one work', '/images/revisionistI.svg'),
	('Worker Bee II', 'Create 10 works', '/images/revisionistI.svg'),
	('Worker Bee III', 'Create 100 editions', '/images/revisionistI.svg');

INSERT INTO bookbrainz.title_type ("title", "description") VALUES
	('Revisionist', 'Complete the Revisionist series of badges'),
	('Creator Creator', 'Complete the Creator Creator series of badges'),
	('Publisher', 'Complete the Publisher series of badges'),
	('Fun Runner', 'Complete the Fun Runner Achievement'),
	('Sprinter', 'Complete the Sprinter Achievement'),
	('Marathoner', 'Complete the Marathoner Achievement'),
	('Worker Bee', 'Complete the Worker Bee series of badges'),
	('Publisher Creator', 'Complete the Publisher Creator series of badges'),
	('Limited Edition', 'Complete the Limited Edition series of badges'),
	('Hot Off the Press', 'Complete the Hot Off the Press Achievement'),
	('Time Traveller', 'Complete the Time Traveller achievement');

COMMIT;
