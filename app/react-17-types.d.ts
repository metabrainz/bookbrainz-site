/*
 * The project still type-checks against the React 17 types (react-bootstrap 1.x, react-fontawesome and other
 * libraries do not type-check with newer ones). These two React 18 APIs are used by the default entry files of
 * React Router; delete this file when the project moves to the React 19 types.
 */
// Makes this file a module, so the declarations below add to the existing ones
export {};

declare module 'react' {
	export function startTransition(scope: () => void): void;

	/*
	 * react-i18next 17 adds to React.JSX, which the React 17 types do not have (JSX is global there). TypeScript then
	 * looks for the JSX elements in React.JSX and finds none, so mirror the global namespace.
	 */
	namespace JSX {
		interface Element extends globalThis.JSX.Element {}
		interface ElementClass extends globalThis.JSX.ElementClass {}
		interface ElementAttributesProperty extends globalThis.JSX.ElementAttributesProperty {}
		interface ElementChildrenAttribute extends globalThis.JSX.ElementChildrenAttribute {}
		type LibraryManagedAttributes<C, P> = globalThis.JSX.LibraryManagedAttributes<C, P>;
		interface IntrinsicClassAttributes<T> extends globalThis.JSX.IntrinsicClassAttributes<T> {}
		interface IntrinsicElements extends globalThis.JSX.IntrinsicElements {}
	}
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
