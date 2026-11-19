/* eslint-disable import/no-unresolved, node/no-missing-import, import/export */
/*
 * Target of the `react-dom` alias in webpack.client.js: the real react-dom plus a
 * findDOMNode implementation, because React 19 removed ReactDOM.findDOMNode while
 * several UI libraries still call it (see find-dom-node.js for details).
 * `react-dom-original` is the second alias and points at the real react-dom.
 * REMOVE this file and both aliases together with find-dom-node.js.
 */
import ReactDOM from 'react-dom-original';
import findDOMNode from './find-dom-node';


export * from 'react-dom-original';
export {findDOMNode};
export default {...ReactDOM, findDOMNode};
