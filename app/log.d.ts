declare module 'log' {
	type LogMethod = (message?: unknown, ...values: unknown[]) => void;
	const log: {
		error: LogMethod;
		warning: LogMethod;
		notice: LogMethod;
		info: LogMethod;
		debug: LogMethod;
	};
	export default log;
}
