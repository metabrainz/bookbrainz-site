BEGIN TRANSACTION;

DROP TABLE IF EXISTS bookbrainz.admin_log;
DROP TYPE IF EXISTS bookbrainz.admin_action_type;

COMMIT;