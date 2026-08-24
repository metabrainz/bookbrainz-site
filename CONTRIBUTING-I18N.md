# Internationalization (i18n) for Developers

If you're reading this, you're probably writing a new component or modifying an existing one and want
to make sure the UI text is translatable. This guide covers everything you need to know.

For **translating strings** into other languages (not coding), visit the
[MetaBrainz Weblate platform](https://translations.metabrainz.org/).

## How It Works

BookBrainz uses [react-i18next](https://react.i18next.com/) for internationalization. Instead of
hardcoding English text in components, we store all user-visible strings in JSON locale files under
`public/locales/en/` and look them up at render time using a `translate()` function.

When a translator adds a French translation on Weblate, the same component will automatically
render French text for French-speaking users, no code changes needed.

## Writing a Translatable Component

Here's what a typical translatable component looks like:

```jsx
import {useTranslation} from 'react-i18next';

function MyComponent() {
    const {t: translate} = useTranslation(['pages', 'common']);
    return <h1>{translate('myPage.title')}</h1>;
}
```

And the matching key in `public/locales/en/pages.json`:

```json
{
  "myPage.title": "My Page Title"
}
```

That's it — the string will render in the user's language once translated, and fall back to English
if no translation is available.

## ESLint and the `t` Variable

The project's ESLint config enforces a minimum variable name length of 2 characters (`id-length`
rule). The `t` function returned by `useTranslation` is only one character, so you **must**
destructure it with an alias:

 * **Do this:** `const {t: translate} = useTranslation();`
 * **Don't do this:** `const {t} = useTranslation();` — this will fail the linter

## Namespaces

Translation keys are organized into **namespaces**, each stored in a separate JSON file under
`public/locales/en/`. Here are the current namespaces:

 * `common` (`common.json`) — shared UI text: buttons, labels, nav items, entity types
 * `pages` (`pages.json`) — page-specific text: index, registration, search, revisions
 * `staticPages` (`staticPages.json`) — static content pages: about, help, FAQ, contribute, privacy
 * `errors` (`errors.json`) — error messages and detailed error descriptions
 * `entities` (`entities.json`) — entity display pages
 * `entityEditor` (`entityEditor.json`) — entity editor form labels, buttons, and validation text

If a string is reused across many pages (e.g. a button label like "Submit"), put it in `common`.
If it's specific to one page or feature, use the matching namespace.

### Accessing multiple namespaces

Pass an array to `useTranslation`. The **first** namespace becomes the default:

```jsx
const {t: translate} = useTranslation(['staticPages', 'common']);

// Default namespace (staticPages) — no prefix needed:
translate('about.title')

// Another namespace — prefix with the namespace name and a colon:
translate('common:button.submit')
```

## Key Naming Conventions

### Dot-notation keys (most namespaces)

Use `section.keyName` in camelCase:

```json
{
  "button.returnToMain": "Return to Main Page",
  "nav.profile": "Profile",
  "registration.authIntroText": "To sign up as an editor..."
}
```

### Natural-language keys (`errors.json` only)

Error keys use the **full English sentence** as the key:

```json
{
  "Page not found": "Page not found",
  "You are not currently authenticated": "You are not currently authenticated"
}
```

Why? Error messages are defined as plain strings in the server-side error classes
(`src/common/helpers/error.js`). The server sends these strings directly to the client
(e.g. `error.message = "Page not found"`), and the client passes them straight to
`translate(error.message)`. Using the English text as the key avoids having to rewrite
every error class to emit key names.

## Interpolation (Dynamic Values)

To insert a variable into a translated string, use double curly braces `{{variableName}}`
in the locale file and pass the value as an option:

Locale file:
```json
{
  "greeting": "Hello, {{name}}!"
}
```

Component:
```jsx
translate('greeting', {name: userName, interpolation: {escapeValue: false}})
```

**Why `escapeValue: false`?** By default i18next HTML-escapes interpolated values
(e.g. `/` becomes `&#x2F;`). Since React already escapes rendered output, this causes
double-escaping. Add `interpolation: {escapeValue: false}` whenever your interpolated
value might contain characters like `/`, `<`, or `&`.

## Adding a New Namespace

If none of the existing namespaces fit your new feature, you can create one. Three files
must be updated:

#### 1. Create the locale file

Create `public/locales/en/myNamespace.json`:
```json
{
  "myKey": "My translated text"
}
```

#### 2. Register in the client-side i18n config

Add the namespace to the `ns` array in `src/common/i18n/i18n.ts`:
```js
ns: ['common', 'entityEditor', 'myNamespace', 'pages', 'entities', 'errors', 'staticPages'],
```

#### 3. Register in the server-side resource loader

Add it to `loadAllNamespaces` in `src/server/helpers/middleware.ts`:
```js
async function loadAllNamespaces(loc) {
    return {
        common: await load(loc, 'common'),
        entities: await load(loc, 'entities'),
        entityEditor: await load(loc, 'entityEditor'),
        errors: await load(loc, 'errors'),
        myNamespace: await load(loc, 'myNamespace'),
        pages: await load(loc, 'pages'),
        staticPages: await load(loc, 'staticPages')
    };
}
```

If you skip step 3, the first server-rendered page load will display raw translation keys
instead of translated text.

## Checklist Before Submitting

Before opening a PR that touches i18n, make sure:

 * All user-visible strings use `translate()`, no hardcoded English text
 * Keys are added to the correct JSON file in `public/locales/en/`
 * Key names follow the naming convention of the target namespace
 * No duplicate keys — check if a shared key already exists in `common.json` first
 * `useTranslation` is destructured as `{t: translate}` (not `{t}`)
 * If you created a new namespace, it's registered in both `i18n.ts` and `middleware.ts`
 *   Run `yarn parse-i18n`.
 * `npm run lint` passes with no new errors
