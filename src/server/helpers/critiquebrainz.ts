import request from 'superagent';


export const getReviewsFromCB = async (
	bbid: string,
	entityType: string
): Promise<any> => {
	const mapEntityType = {
		EditionGroup: 'bb_edition_group'
	};
	entityType = mapEntityType[entityType];
	if (!entityType) {
		return [];
	}
	const res = await request
		.get('https://critiquebrainz.org/ws/1/review')
		.query({
			entity_id: bbid,
			entity_type: entityType,
			limit: 10,
			offset: 0
		});
	return res.body;
};
