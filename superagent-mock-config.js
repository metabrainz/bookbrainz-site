/* eslint-disable camelcase */
const mockConfig = [
	{
		fixtures: (match, params, headers) => {
			// extract auth token from headers
			const token = headers.Authorization.split(' ')[1];
			// using user id as tokens for testing
			let sub;
			let metabrainz_user_id;
			switch (token) {
				case '1':
					sub = 'UserDeleter';
					metabrainz_user_id = 2007538;
					break;
				case '2':
					sub = 'NormalUser1';
					metabrainz_user_id = 2;
					break;
				case '3':
					sub = 'NormalUser2';
					metabrainz_user_id = 3;
					break;
				default:
					sub = 'UnknownUser';
					metabrainz_user_id = 0;
					break;
			}
			const body = {
				metabrainz_user_id,
				sub
			};
			return {body};
		},
		get(match, data) {
			return data;
		},
		pattern: 'https://musicbrainz.org/oauth2/userinfo'
	}
];

export default mockConfig;
