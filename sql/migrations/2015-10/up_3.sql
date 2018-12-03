---------------------
-- Rename ID Fields
---------------------

BEGIN;

ALTER TABLE bookbrainz.message_receipt DROP CONSTRAINT message_receipt_pkey;

ALTER TABLE bookbrainz.message_receipt ADD COLUMN id SERIAL;
CREATE UNIQUE INDEX message_receipt_pkey ON bookbrainz.message_receipt (id);
ALTER TABLE bookbrainz.message_receipt ADD PRIMARY KEY USING INDEX message_receipt_pkey;

COMMIT;
