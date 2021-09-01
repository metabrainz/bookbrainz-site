import BookBrainzData from 'bookbrainz-data';
import {EventEmitter} from 'events';
import config from '../../config/config.json';
import {kebabCase} from 'lodash';
const eventEmitter = new EventEmitter();


const orm = BookBrainzData(config.database);


eventEmitter.on('send-notifications-for-collection', async (collectionId, editorId) => {
	const {CollectionSubscription, Notification, Editor} = orm;
	const allSubscribers = await new CollectionSubscription()
		.where('collection_id', collectionId)
		.fetchAll({
			required: false,
			withRelated: ['collection']
		});
	const editor = await new Editor({id: editorId}).fetch();
	const editorJSON = editor.toJSON();

	const notificationPromiseArray = [];
	allSubscribers.forEach(subscriber => {
		if (subscriber.get('subscriberId') !== editorId) {
			const subscriberJSON = subscriber.toJSON();
			notificationPromiseArray.push(
				new Notification({
					notificationRedirectLink: `/collection/${collectionId}`,
					notificationText: `${editorJSON.name} edited ${subscriberJSON.collection.name} collection`,
					read: false,
					subscriberId: subscriber.get('subscriberId')
				}).save(null, {method: 'insert'})
			);
		}
	});
	await Promise.all(notificationPromiseArray);
});

eventEmitter.on('send-notifications-for-entity', async (bbid, editorId, entityType) => {
	const {EntitySubscription, Notification, Editor} = orm;
	const allSubscribers = await new EntitySubscription()
		.where('bbid', bbid)
		.fetchAll({
			required: false,
			withRelated: ['entity']
		});
	const editor = await new Editor({id: editorId}).fetch();
	const editorJSON = editor.toJSON();

	const notificationPromiseArray = [];
	allSubscribers.forEach(subscriber => {
		if (subscriber.get('subscriberId') !== editorId) {
			notificationPromiseArray.push(
				new Notification({
					notificationRedirectLink: `/${kebabCase(entityType)}/${bbid}`,
					notificationText: `${editorJSON.name} edited ${kebabCase(entityType)} ${bbid}`,
					read: false,
					subscriberId: subscriber.get('subscriberId')
				}).save(null, {method: 'insert'})
			);
		}
	});
	await Promise.all(notificationPromiseArray);
});

export default eventEmitter;
