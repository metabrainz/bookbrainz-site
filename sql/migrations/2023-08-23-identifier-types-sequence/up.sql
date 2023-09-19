BEGIN TRANSACTION;
SELECT SETVAL('identifier_type_id_seq', (SELECT MAX(id) FROM identifier_type));
COMMIT;