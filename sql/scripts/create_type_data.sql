BEGIN;

INSERT INTO bookbrainz.achievement_type ("name", "description", "badge_url") VALUES
	('Revisionist I', 'Perform one revision', '/images/revisionistI.svg'),
	('Revisionist II', 'Perform 50 revisions', '/images/revisionistII.svg'),
	('Revisionist III', 'Perform 250 revisions', '/images/revisionistIII.svg'),
	('Author Creator I', 'Create one author', '/images/authorcreatorI.svg'),
	('Author Creator II', 'Create 10 authors', '/images/authorcreatorII.svg'),
	('Author Creator III', 'Create 100 authors', '/images/authorcreatorIII.svg'),
	('Publisher I', 'Create one edition group', '/images/PublisherI.svg'),
	('Publisher II', 'Create 10 edition groups', '/images/PublisherII.svg'),
	('Publisher III', 'Create 100 edition groups', '/images/PublisherIII.svg'),
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
	('Worker Bee III', 'Create 100 editions', '/images/revisionistI.svg'),
	('Explorer I', 'View 10 different entities', '/images/revisionistI.svg'),
	('Explorer II', 'View 100 different entities', '/images/revisionistI.svg'),
	('Explorer III', 'View 1000 different entities', '/images/revisionistI.svg');

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
	('Time Traveller', 'Complete the Time Traveller achievement'),
	('Explorer', 'Complete the Explorer sereies of badges');

COMMIT;
