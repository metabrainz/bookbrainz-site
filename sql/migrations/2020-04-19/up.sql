BEGIN;
--(BB-445)

-- Delete achievement where GSoC-2016 was unlocked
DELETE FROM "bookbrainz"."achievement_unlock"
WHERE id = 13;

-- Delete GSoC 2016 as an achievement
DELETE FROM "bookbrainz"."achievement_type"
WHERE id = 27;

-- Insert GSoC as an achievement(not year specific)
INSERT INTO "bookbrainz"."achievement_type" ("id", "name", "description", "badge_url")
VALUES
	('27', 'GSoC', 'Successfully participated in Google Summer of Code', '/images/GSoC_logo.png');

-- Inserting GSoC achievement to previous user
INSERT INTO "bookbrainz"."achievement_unlock" ("id", "editor_id", "achievement_id", "unlocked_at", "profile_rank")
VALUES
	('13', '292', '27', '2016-09-07 20:43:21', '1');

COMMIT;
