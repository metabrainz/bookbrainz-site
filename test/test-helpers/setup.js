/* eslint-disable node/no-process-env */
/* Taken from: ListenBrainz */

// In Node > v15 unhandled promise rejections will terminate the process
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
	process.on('unhandledRejection', (err) => {
		// eslint-disable-next-line no-console
		console.log('Unhandled promise rejection:', err);
	});
	// Avoid memory leak by adding too many listeners
	process.env.LISTENING_TO_UNHANDLED_REJECTION = 'true';
}

/**
 * HTML of a rendered container that is safe to snapshot: react-select numbers
 * its instances with a process-wide counter, so the ids it generates depend on
 * which tests ran before.
 * @param {Element} container - the container returned by render()
 * @returns {string} the container's HTML with instance ids neutralised
 */
export function stableHtml(container) {
	return container.innerHTML.replace(/react-select-\d+-/g, 'react-select-N-');
}
