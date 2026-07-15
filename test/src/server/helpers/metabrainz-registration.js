/* eslint-disable camelcase */
import * as metabrainzRegistration from '../../../../src/server/helpers/metabrainz-registration';
import {restore, stub} from 'sinon';
import chai from 'chai';
import request from 'superagent';


const {expect} = chai;

describe('MetaBrainz registration request helper', () => {
	afterEach(() => {
		restore();
	});

	function stubPost(responseBody) {
		const chain = {
			send: stub().resolves({body: responseBody}),
			type: stub()
		};
		chain.type.returns(chain);
		stub(request, 'post').returns(chain);
		return chain;
	}

	function stubGet(responseBody) {
		const chain = {
			set: stub().resolves({body: responseBody})
		};
		stub(request, 'get').returns(chain);
		return chain;
	}

	it('stores PKCE state and creates a registration request', async () => {
		const req = {session: {}};
		const chain = stubPost({
			redirect_to: 'https://metabrainz.org/oauth2/registration-requests/mebrq_test'
		});

		const response = await metabrainzRegistration.createRegistrationRequest(
			req,
			'alice',
			'alice@example.com'
		);

		expect(response.redirect_to).to.equal(
			'https://metabrainz.org/oauth2/registration-requests/mebrq_test'
		);
		expect(req.session.metabrainzRegistrationRequest.state).to.be.a('string');
		expect(req.session.metabrainzRegistrationRequest.codeVerifier).to.be.a('string');
		expect(req.session.metabrainzRegistrationRequest.createdAt).to.be.a('number');

		const formBody = chain.send.firstCall.args[0];
		expect(formBody.username).to.equal('alice');
		expect(formBody.email).to.equal('alice@example.com');
		expect(formBody.scope).to.equal('profile');
		expect(formBody.response_type).to.equal('code');
		expect(formBody.code_challenge_method).to.equal('S256');
		expect(formBody.state).to.equal(req.session.metabrainzRegistrationRequest.state);
		expect(formBody.code_challenge).to.be.a('string');
		expect(formBody.code_challenge).not.to.equal(
			req.session.metabrainzRegistrationRequest.codeVerifier
		);
	});

	it('detects only callbacks with the pending registration state', () => {
		const req = {
			query: {state: 'known-state'},
			session: {
				metabrainzRegistrationRequest: {
					state: 'known-state'
				}
			}
		};

		expect(metabrainzRegistration.isRegistrationRequestCallback(req)).to.equal(true);

		req.query.state = 'other-state';
		expect(metabrainzRegistration.isRegistrationRequestCallback(req)).to.equal(false);
	});

	it('treats pending requests older than five minutes as expired', () => {
		expect(metabrainzRegistration.isPendingRegistrationRequestExpired({
			createdAt: Date.now() - metabrainzRegistration.getRegistrationRequestExpiresInMs() - 1
		})).to.equal(true);

		expect(metabrainzRegistration.isPendingRegistrationRequestExpired({
			createdAt: Date.now()
		})).to.equal(false);
	});

	it('exchanges the callback code with the stored PKCE verifier', async () => {
		const req = {
			query: {code: 'oauth-code'},
			session: {
				metabrainzRegistrationRequest: {
					codeVerifier: 'stored-verifier'
				}
			}
		};
		const chain = stubPost({access_token: 'access-token'});

		await metabrainzRegistration.exchangeRegistrationRequestCode(req);

		const formBody = chain.send.firstCall.args[0];
		expect(formBody.code).to.equal('oauth-code');
		expect(formBody.code_verifier).to.equal('stored-verifier');
		expect(formBody.grant_type).to.equal('authorization_code');
	});

	it('fetches UserInfo with the access token as a bearer token', async () => {
		const chain = stubGet({sub: '12345', username: 'alice'});

		const userInfo = await metabrainzRegistration.fetchUserInfo('access-token');

		expect(userInfo).to.deep.equal({sub: '12345', username: 'alice'});
		expect(chain.set.calledWith('Authorization', 'Bearer access-token')).to.equal(true);
	});

	it('uses upstream error descriptions when present', () => {
		const message = metabrainzRegistration.getRegistrationRequestErrorMessage({
			response: {
				body: {
					error: 'invalid_request',
					error_description: 'That email address is already in use.'
				}
			}
		});

		expect(message).to.equal('That email address is already in use.');
	});
});
