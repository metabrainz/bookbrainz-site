BEGIN TRANSACTION;
UPDATE bookbrainz.identifier_type
SET display_template = 'Placeholder Template'
WHERE id IN (1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34);
COMMIT;