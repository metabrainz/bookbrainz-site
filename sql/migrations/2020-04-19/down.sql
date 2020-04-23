BEGIN;

-- Delete achievement where GSoC was unlocked
DELETE FROM "bookbrainz"."achievement_unlock"
WHERE id = 13;

-- Delete GSoC as an achievement
DELETE FROM "bookbrainz"."achievement_type"
WHERE id = 27;

-- Inserting GSoC 2016 as an achievement
INSERT INTO "bookbrainz"."achievement_type" ("id", "name", "description", "badge_url")
VALUES
	('27', 'GSoC 2016', 'Successfully participated in Google Summer of Code 2016', '/images/gsoc2016.svg');

-- Inserting achievement to the user which had GSoC 2016 unlocked
INSERT INTO "bookbrainz"."achievement_unlock" ("id", "editor_id", "achievement_id", "unlocked_at", "profile_rank")
VALUES
	('13', '292', '27', '2016-09-07 20:43:21', '1');

COMMIT;
