BEGIN;
-- (BB-463)

-- IMDb Title ID for Work rather than Edition
UPDATE bookbrainz.identifier_type
SET entity_type='Work'

WHERE id=16;


-- Edition (Around the World in Eighty Days)
INSERT INTO bookbrainz.identifier_set__identifier ("set_id","identifier_id")
VALUES
	('3318','5377');

INSERT INTO bookbrainz.identifier_set__identifier ("set_id","identifier_id")
VALUES
	('3305','5377');

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5377 AND set_id=3345;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5377 AND set_id=3346;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5377 AND set_id=3344;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5377 AND set_id=3333;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5377 AND set_id=3329;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5377 AND set_id=3327;


-- Edition (Ranger's Apprentice: The Ruins of Gorlan) - 4 types of edition
DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5550 AND set_id=3412;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5550 AND set_id=3435;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5550 AND set_id=3436;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5550 AND set_id=3439;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5550 AND set_id=3443;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5558 AND set_id=3413;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5482 AND set_id=3383;

DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=5459 AND set_id=3374;

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3373','5459');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3415','5482');

INSERT INTO "bookbrainz"."identifier_set__identifier" ("set_id","identifier_id")
VALUES
	('3434','5550');


-- Edition (Veyipadagalu) - IMDb Title Id here was invalid
DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=4678 AND set_id=3036;

-- Edition (തേനും തേനീച്ചപ്പാലും) - Revelant work will be added later
DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=2584 AND set_id=1997;

-- Author (Moheen Reeyad) - Relevant work will be added later
DELETE FROM "bookbrainz"."identifier_set__identifier"
WHERE
	identifier_id=1783 AND set_id=1469;

COMMIT;
