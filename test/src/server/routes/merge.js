import {createAuthor, createEditor, createWork, getRandomUUID, truncateEntities} from '../../../test-helpers/create-entities';

import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;
const urlBase = 'http://127.0.0.1:9099';

describe('Merge routes', () => {
	describe('/add route', () => {
		const aBBID = getRandomUUID();
		const bBBID = getRandomUUID();
		const cBBID = getRandomUUID();
		const nonExistingEntity = getRandomUUID();
		const inValidBBID = 'have-you-seen-the-fnords';
		let agent;
		before(async () => {
			await truncateEntities();
			await createAuthor(aBBID);
			await createAuthor(bBBID);
			await createWork(cBBID);
			try {
				await createEditor(123456);
			}
			catch (error) {
				// console.log(error);
			}
			// The `agent` now has the sessionid cookie saved, and will send it
			// back to the server in the next request:
			agent = await chai.request.agent(app);
			await agent.get('/cb');
		});
		after((done) => {
			// Clear DB tables then close superagent server
			truncateEntities().then(() => {
				agent.close(done);
			});
		});

		it('should throw an 400 error if adding an invalid BBID', (done) => {
			agent.get(`/merge/add/${inValidBBID}`)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).not.to.redirect;
					expect(res).to.have.status(400);
					expect(res.res.statusMessage).to.equal(`Invalid bbid: ${inValidBBID}`);
					done();
				});
		});
		it('should throw an 404 error if BBID is absent (invalid route)', (done) => {
			agent.get('/merge/add/')
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).not.to.redirect;
					expect(res).to.have.status(404);
					done();
				});
		});
		it('should throw a 404 error if entity does not exist', (done) => {
			agent.get(`/merge/add/${nonExistingEntity}`)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(404);
					expect(res.res.statusMessage).to.equal('Entity not found');
					done();
				});
		});
		it('should add an entity to the merge queue', (done) => {
			agent.get(`/merge/add/${aBBID}`)
				.set('referer', `/author/${aBBID}`)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res).to.redirectTo(`${urlBase}/author/${aBBID}`);
					// Not sure how to check the private user session here
					// Instead, try submitting, and we should get an error message
					// complaining about only one entity in the merge queue
					agent.get('/merge/submit')
						.end((err2, response) => {
							expect(err2).to.be.null;
							expect(response).to.have.status(409);
							expect(response.res.statusMessage).to.equal('You must have at least 2 entities selected to merge');
							done();
						});
				});
		});
		it('should do nothing and redirect when adding the same entity BBID', (done) => {
			agent.get(`/merge/add/${aBBID}`)
				.set('referer', `/author/${aBBID}`)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res).to.redirectTo(`${urlBase}/author/${aBBID}`);
					done();
				});
		});
		it('should allow adding another entity of same type to the merge queue', (done) => {
			agent.get(`/merge/add/${bBBID}`)
				.set('referer', `/author/${bBBID}`)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res).to.redirectTo(`${urlBase}/author/${bBBID}`);
					done();
				});
		});

		it('should recreate the merge queue if adding another entity type', (done) => {
			agent.get(`/merge/add/${cBBID}`)
				.set('referer', `/work/${cBBID}`)
				.then(res => {
					expect(res).to.have.status(200);
					expect(res).to.redirectTo(`${urlBase}/work/${cBBID}`);
					// This should have recreated the mergequeue with this single item, and submitting will throw an error
					agent.get('/merge/submit')
						.end((err, response) => {
							expect(err).to.be.null;
							expect(response).to.have.status(409);
							expect(response.res.statusMessage).to.equal('You must have at least 2 entities selected to merge');
							done();
						});
				});
		});
	});

	describe('/cancel route', () => {
		const aBBID = getRandomUUID();
		const bBBID = getRandomUUID();
		let agent;
		before(async () => {
			await truncateEntities();
			await createAuthor(aBBID);
			await createAuthor(bBBID);
			try {
				await createEditor(123456);
			}
			catch (error) {
				// console.log(error);
			}
			agent = await chai.request.agent(app);
			// Log in and reuse agent session
			await agent.get('/cb');
		});
		after((done) => {
			// Clear DB tables then close superagent server
			truncateEntities().then(() => {
				agent.close(done);
			});
		});
		it('should clear the merge queue', (done) => {
			agent.get(`/merge/add/${aBBID}`)
				.set('referer', `/author/${aBBID}`)
				.then(() => agent.get(`/merge/add/${bBBID}`)
					.set('referer', `/author/${bBBID}`))
				.then(() => agent.get('/merge/submit'))
				.then(res => {
					// expect mergequeue to exist and have two items
					expect(res).to.be.ok;
					return agent.get('/merge/cancel')
						.set('referer', `/author/${bBBID}`);
				})
				.then(() => {
					agent.get('/merge/submit')
						.set('referer', `/author/${bBBID}`)
						.end((error, response) => {
							expect(error).to.be.null;
							expect(response).to.have.status(409);
							expect(response.res.statusMessage).to.equal('No entities selected for merge');
							done();
						});
				}).catch(done);
		});
	});
});
