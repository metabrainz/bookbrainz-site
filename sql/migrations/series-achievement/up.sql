BEGIN;


INSERT INTO bookbrainz.title_type (id, title, description)
VALUES
( 13, 'Series Creator', 'Complete the Series Creator Achievement');

INSERT INTO bookbrainz.achievement_type (id, name, description, badge_url)
VALUES
( 28, 'Series Creator I', 'Create one Series', '/images/blankbadge.svg'),
( 29, 'Series Creator II', 'Create 10 Series', '/images/blankbadge.svg'),
( 30, 'Series Creator III', 'Create 100 Series', '/images/blankbadge.svg');


COMMIT;