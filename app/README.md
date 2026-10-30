# React Router pages

React Router renders pages on the server and hydrates them in the browser. Express owns authentication and JSON endpoints.

- `yarn build-router` builds the client and server into `build-router/`.
- `root.tsx` defines the document and shared layout; `routes.ts` lists frontend routes.
- Vite keeps the existing JSX and React compatibility settings until the older UI dependencies are replaced.
- Webpack continues building pages that have not moved to React Router.

`yarn typecheck-app` generates route types and checks the app with strict TypeScript settings. Lint uses the existing `.eslintrc.js` configuration.

Loaders receive a typed backend and request context. Data access lives in `src/backend`; page modules never import the ORM or Express helpers.

`app/auth.server.ts` guards pages. Passport, OAuth and login/logout remain in Express. Backend functions enforce permissions for data operations.
