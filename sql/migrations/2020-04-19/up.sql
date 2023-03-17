BEGIN;
--(BB-445)

-- Updating the GSoC achievement
UPDATE bookbrainz.achievement_type
SET name='GSoC',
	description='Successfully participated in Google Summer of Code',
	badge_url='/images/GSoC_logo.png'

WHERE id=27;

COMMIT;
