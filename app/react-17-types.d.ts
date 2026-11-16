/*
 * The project still type-checks against the React 17 types (react-bootstrap 1.x, react-fontawesome and other
 * libraries do not type-check with newer ones). These two React 18 APIs are used by the default entry files of
 * React Router; delete this file when the project moves to the React 19 types.
 */
// Makes this file a module, so the declarations below add to the existing ones
export {};

declare module 'react' {
	export function startTransition(scope: () => void): void;
}

declare module 'react-dom/server' {
	export type RenderToPipeableStreamOptions = {
		onAllReady?: () => void,
		onError?: (error: unknown) => void,
		onShellError?: (error: unknown) => void,
		onShellReady?: () => void
	};

	export function renderToPipeableStream(
		children: React.ReactNode,
		options?: RenderToPipeableStreamOptions
	): {abort: () => void, pipe: <Writable extends NodeJS.WritableStream>(destination: Writable) => Writable};
}
