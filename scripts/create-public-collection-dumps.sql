BEGIN TRANSACTION;

-- duplicate user_collection table with public collections only

CREATE table if not exists public_user_collection (LIKE bookbrainz.user_collection INCLUDING ALL);
ALTER TABLE bookbrainz.public_user_collection
	ADD CONSTRAINT public_user_collection_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES editor(id);

INSERT INTO public_user_collection
	select * from user_collection uc where uc.public is true;

-- duplicate user_collection_item table with public collections' items only

CREATE table if not exists public_user_collection_item (LIKE bookbrainz.user_collection_item INCLUDING ALL);
ALTER TABLE bookbrainz.public_user_collection_item
	ADD CONSTRAINT public_user_collection_item_bbid_fkey FOREIGN KEY (bbid) REFERENCES entity(bbid);

ALTER TABLE bookbrainz.public_user_collection_item
	ADD CONSTRAINT public_user_collection_item_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES bookbrainz.public_user_collection(id) ON DELETE CASCADE;


INSERT INTO public_user_collection_item
	select uci.* from user_collection_item uci right join public_user_collection on uci.collection_id = public_user_collection.id;

-- duplicate user_collection_collaborator table with public collections' collaborators only

CREATE table if not exists public_user_collection_collaborator (LIKE bookbrainz.user_collection_collaborator INCLUDING ALL);
ALTER TABLE bookbrainz.public_user_collection_collaborator
	ADD CONSTRAINT public_user_collection_collaborator_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES editor(id);
ALTER TABLE bookbrainz.public_user_collection_collaborator
	ADD CONSTRAINT public_user_collection_collaborator_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES bookbrainz.public_user_collection(id) ON DELETE CASCADE;

INSERT INTO public_user_collection_collaborator
	select ucc.* from user_collection_collaborator ucc inner join public_user_collection on ucc.collection_id = public_user_collection.id;

COMMIT;