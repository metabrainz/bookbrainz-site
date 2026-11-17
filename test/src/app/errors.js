import {BadRequestError, SiteError} from '../../../src/common/helpers/error';
import {siteErrors, toRouteError} from '../../../app/errors.server';
import {expect} from 'chai';


describe('loader errors', () => {
	it('keeps intentional statuses across module copies', () => {
		const original = new BadRequestError('Invalid type');
		const transferred = Object.assign(new Error(original.message), original, {detailedMessage: ['Check the type']});
		expect(transferred).not.to.be.instanceOf(SiteError);
		const result = toRouteError(transferred);
		expect(result.init.status).to.equal(400);
		expect(result.data).to.deep.equal({detailedMessage: ['Check the type'], message: 'Invalid type'});
	});

	it('does not accept an arbitrary error with an HTTP status', () => {
		const result = toRouteError(Object.assign(new Error('Unexpected'), {name: 'FakeError', status: 404}));
		expect(result.init.status).to.equal(500);
	});

	it('preserves a thrown redirect response', () => {
		const response = new Response(null, {headers: {Location: '/auth'}, status: 303});
		expect(toRouteError(response)).to.equal(response);
	});

	it('preserves loader arguments and return values', async () => {
		const loader = siteErrors(({value}) => value * 2);
		expect(await loader({value: 3})).to.equal(6);
	});
});
