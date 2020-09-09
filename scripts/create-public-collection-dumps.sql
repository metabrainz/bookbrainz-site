CREATE table if not exists public_user_collection AS
select * from bookbrainz.user_collection uc where uc.public is true;

CREATE table if not exists public_user_collection_item AS
select uci.* from user_collection_item uci right join public_user_collection on uci.collection_id = public_user_collection.id;

CREATE table if not exists public_user_collection_collaborator AS
select ucc.* from user_collection_collaborator ucc inner join public_user_collection on ucc.collection_id = public_user_collection.id;