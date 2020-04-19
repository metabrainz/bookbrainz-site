BEGIN;
--(BB-445)

-- Delete achievement where GSoC-2016 was unlocked
DELETE FROM "bookbrainz"."achievement_unlock"
WHERE id = 13;

-- Delete GSoC 2016 as an achievement
DELETE FROM "bookbrainz"."achievement_type"
WHERE id = 27;

COMMIT;
