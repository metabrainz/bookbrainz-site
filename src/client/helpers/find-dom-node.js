/*
 * A stand-in for ReactDOM.findDOMNode, for libraries that still call it.
 *
 * React 19 removed ReactDOM.findDOMNode. Several of the UI libraries we depend on
 * (react-bootstrap 1.x through react-transition-group, react-overlays,
 * react-onclickoutside via react-datepicker, react-sortable-hoc, react-sticky, ...)
 * still call it on class component instances, e.g. for every Modal, Tooltip or
 * Collapse transition. Until these libraries are replaced this function is put
 * back for them: in the browser bundle webpack points the bare `react-dom` import
 * at react-dom-compat.js (see resolve.alias in webpack.client.js), and the tests
 * assign it in test/test-helpers/setup.js. `react-dom/client` and our own code are
 * not affected, and nothing is needed on the server because the libraries only
 * call findDOMNode from lifecycle methods that never run there.
 *
 * It reads the (private) `_reactInternals` fiber of a class component instance,
 * the same field React used for the same lookup, and returns the first host
 * (DOM) node rendered by it. REMOVE THIS FILE (with react-dom-compat.js, the
 * alias and the line in the test setup) once no dependency calls findDOMNode.
 */

const HOST_ROOT = 3;
const HOST_COMPONENT = 5;
const HOST_TEXT = 6;
const ELEMENT_NODE = 1;

/**
 * A fiber exists twice (current and work-in-progress). Pick the one that is in
 * the tree React currently displays, like React's own findCurrentFiber.
 * @param {Object} fiber - a fiber of the component
 * @returns {Object} the fiber that belongs to the current tree
 */
function getCurrentFiber(fiber) {
	let root = fiber;
	while (root.return) {
		root = root.return;
	}
	if (root.tag !== HOST_ROOT) {
		throw new Error('Unable to find node on an unmounted component.');
	}
	if (root.stateNode.current === root) {
		return fiber;
	}
	return fiber.alternate || fiber;
}

function findFirstHostNode(fiber) {
	let {child} = fiber;
	for (; child; child = child.sibling) {
		if (child.tag === HOST_COMPONENT || child.tag === HOST_TEXT) {
			return child.stateNode;
		}
		const found = findFirstHostNode(child);
		if (found) {
			return found;
		}
	}
	return null;
}

export default function findDOMNode(componentOrElement) {
	if (componentOrElement === null || typeof componentOrElement === 'undefined') {
		return null;
	}
	if (componentOrElement.nodeType === ELEMENT_NODE) {
		return componentOrElement;
	}
	const {_reactInternals: fiber} = componentOrElement;
	if (!fiber) {
		throw new Error(`Argument appears to not be a ReactComponent. Keys: ${Object.keys(componentOrElement)}`);
	}
	return findFirstHostNode(getCurrentFiber(fiber));
}
