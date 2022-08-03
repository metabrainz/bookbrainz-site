/* eslint-disable node/no-process-env */
/* Taken from: ListenBrainz */
import * as Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';


Enzyme.configure({adapter: new Adapter()});

// In Node > v15 unhandled promise rejections will terminate the process
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
	process.on('unhandledRejection', (err) => {
		// eslint-disable-next-line no-console
		console.log('Unhandled promise rejection:', err);
	});
	// Avoid memory leak by adding too many listeners
	process.env.LISTENING_TO_UNHANDLED_REJECTION = 'true';
}
