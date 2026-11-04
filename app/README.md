# React Router pages

React Router renders pages on the server and hydrates them in the browser. Express owns authentication and JSON endpoints.

- `yarn build-router` builds the client and server into `build-router/`.
- `root.tsx` defines the document and shared layout; `routes.ts` lists frontend routes.
- Vite keeps the existing JSX and React compatibility settings until the older UI dependencies are replaced.
- Webpack continues building pages that have not moved to React Router.

`yarn typecheck-app` generates route types and checks the app with strict TypeScript settings. Lint uses the existing `.eslintrc.js` configuration.

Loaders receive a typed backend and request context. Data access lives in `src/backend`; page modules never import the ORM or Express helpers.

`app/auth.server.ts` guards pages. Passport, OAuth and login/logout remain in Express. Backend functions enforce permissions for data operations.

The Express entry creates the application before listening. `src/server/helpers/router-build/` loads the production build once, or starts Vite in development. The context factory is a second server-build entry so it shares the loaders' context key. Development resolves it again for each request to support hot updates.

`createApp()` returns `{app, close}`; integration tests share one application fixture. Search availability does not block startup. A missing or invalid Router build does.

Run `yarn build` before integration tests. Startup-failure checks also run against the Babel-compiled server helpers in `lib/`.
