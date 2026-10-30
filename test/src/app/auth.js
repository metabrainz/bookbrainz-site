import {RouterContextProvider} from 'react-router';
import {expect} from 'chai';
import {requireUser} from '../../../app/auth.server';
import {siteContext} from '../../../app/context';


function contextFor(user, session) {
	const context = new RouterContextProvider();
	context.set(siteContext, {session, user});
	return context;
}

describe('page access', () => {
	it('lets an authenticated user through', () => {
		const context = contextFor({id: 7, name: 'editor', privs: 1}, {});
		expect(() => requireUser({context, request: new Request('http://localhost/editor/edit')})).not.to.throw();
	});

	it('redirects anonymous users and saves the return URL', () => {
		const session = {};
		const context = contextFor(null, session);
		let response;
		try { requireUser({context, request: new Request('http://localhost/editor/edit?tab=profile')}); }
		catch (error) { response = error; }
		expect(response.status).to.equal(303);
		expect(response.headers.get('Location')).to.equal('/auth');
		expect(session.redirectTo).to.equal('/editor/edit?tab=profile');
	});
});
