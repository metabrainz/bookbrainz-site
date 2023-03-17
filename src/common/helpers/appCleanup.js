/* eslint-disable node/no-process-exit, no-console, no-process-exit */

/**
 * Captures process exits and signals and calls user-defined cleanup function.
 * On SIGINT, terminate straight away instead of running cleanup function
 * Catches uncaught exceptions, and supports asynchronicity in cleanup function
 * @param {function} cleanupPromise - graceful cleanup function to call on exit.
 * If the function returns false, it will be considered an asynchronous function
 * and you will have to run `process.kill(process.pid, errorCode)` yourself.
 */

function cleanupOnExit(cleanupPromise) {
	process.on('asyncExit', () => {
		cleanupPromise().then(() => {
			console.log('Cleanup process finished');
			process.exit(0);
		}).catch((error) => {
			console.log(error);
			process.exit(1);
		});
	});

	function terminateHandler(code) {
		console.log(`${code} signal received, terminating straight away`);
		// eslint-disable-next-line @typescript-eslint/no-use-before-define -- safe, functions hoisted
		removeAllListeners();
		process.kill(process.pid, code);
	}

	function cleanupHandler(code) {
		console.log(`About to exit with code: ${code}`);
		process.emit('asyncExit', code);
		// callback();
		// eslint-disable-next-line @typescript-eslint/no-use-before-define -- safe, functions hoisted
		removeAllListeners();
	}

	function removeAllListeners() {
		// Node <10 does not have process.off
		if (typeof process.off !== 'function') {
			process.removeListener('exit', cleanupHandler);
			process.removeListener('SIGHUP', cleanupHandler);
			process.removeListener('SIGQUIT', cleanupHandler);
			process.removeListener('SIGTERM', terminateHandler);
			process.removeListener('SIGINT', terminateHandler);
		}
		else {
			process.off('exit', cleanupHandler);
			process.off('SIGHUP', cleanupHandler);
			process.off('SIGQUIT', cleanupHandler);
			process.off('SIGTERM', terminateHandler);
			process.off('SIGINT', terminateHandler);
		}
	}

	process.on('exit', cleanupHandler);
	process.on('SIGHUP', cleanupHandler);
	process.on('SIGQUIT', cleanupHandler);

	// catch ctrl+c event and exit normally
	process.on('SIGINT', terminateHandler);
	process.on('SIGTERM', terminateHandler);

	// catch uncaught exceptions, trace, then exit with error (will trigger cleanup)
	process.on('uncaughtException', (error) => {
		console.error('Uncaught Exception:');
		console.error(error.stack);
		process.exit(1);
	});
}

export default cleanupOnExit;
