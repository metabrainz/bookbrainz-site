BEGIN;

-- Reverting IMDb identifier back to Edition
UPDATE bookbrainz.identifier_type
SET entity_type='Edition'

WHERE id=16;

-- Edition (Around the World in Eighty Days)
DELETE FROM bookbrainz.identifier_set__identifier
WHERE
	identifier_id=5377 AND set_id=3318;

DELETE FROM bookbrainz.identifier_set__identifier
WHERE
	identifier_id=5377 AND set_id=3305;


INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3345','5377');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3346','5377');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3344','5377');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3333','5377');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3329','5377');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3327','5377');


-- Edition (Ranger's Apprentice: The Ruins of Gorlan)
INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3412','5550');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3435','5550');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3436','5550');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3439','5550');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3443','5550');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3413','5558');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3383','5482');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3374','5459');

DELETE FROM bookbrainz.identifier_set__identifier
WHERE
	identifier_id=5459 AND set_id=3373;

DELETE FROM bookbrainz.identifier_set__identifier
WHERE
	identifier_id=5482 AND set_id=3415;

DELETE FROM bookbrainz.identifier_set__identifier
WHERE
	identifier_id=5550 AND set_id=3434;


-- Veyipadagalu (IMDb Title Id here was invalid)
INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3036','4678');

-- Edition (തേനും തേനീച്ചപ്പാലും) - Revelant work will be added later
INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('1997','2584');

-- Author (Moheen Reeyad) - Relevant work will be added later
INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('1469','1783');

COMMIT;
