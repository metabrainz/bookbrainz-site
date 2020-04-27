BEGIN;

-- Reverting the GSoC achievement
UPDATE bookbrainz.achievement_type
SET name='GSoC 2016',
	description='Successfully participated in Google Summer of Code 2016',
	badge_url='/images/gsoc2016.svg'

WHERE id=27;

COMMIT;
