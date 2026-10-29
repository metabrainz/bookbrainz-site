# Internationalization (i18n) for Developers

If you're reading this, you're probably writing a new component or modifying an existing one and want
to make sure the UI text is translatable. This guide covers everything you need to know.

For **translating strings** into other languages (not coding), visit the
[MetaBrainz Weblate platform](https://translations.metabrainz.org/).

## How It Works

BookBrainz uses [react-i18next](https://react.i18next.com/) for internationalization. Instead of
hardcoding English text in components, we store user-visible strings in the English catalog at
`public/locales/en/translation.json` and look them up at render time using a `translate()` function.
Each language has its own `public/locales/<locale>/translation.json` file. The server loads the
selected language and English fallback resources and passes them to the React i18n provider.

When a translator adds a French translation on Weblate, the same component will automatically
render French text for French-speaking users, no code changes needed.

## Writing a Translatable Component

Here's what a typical translatable component looks like:

```jsx
import {useTranslation} from 'react-i18next';

function MyComponent() {
    const {t: translate} = useTranslation();
    return <h1>{translate('pages.myPage.title')}</h1>;
}
```

And the matching key in `public/locales/en/translation.json`:

```json
{
  "pages": {
    "myPage": {
      "title": "My Page Title"
    }
  }
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

## Translation File Structure

The application uses one i18next namespace, `translation`. Within `translation.json`, keys are
organized into nested objects:

 * `common` — shared UI text: buttons, labels, nav items, entity types
 * `pages` — page-specific text: index, registration, search, revisions
 * `staticPages` — static content pages: about, help, FAQ, contribute, privacy
 * `errors` — error messages and detailed error descriptions
 * `entities` — entity display pages
 * `entityEditor` — entity editor form labels, buttons, and validation text

These groups are key prefixes, not separate namespaces or files. Use `useTranslation()` without
arguments and include the full dotted path in each call:

```jsx
const {t: translate} = useTranslation();

translate('staticPages.about.chatWithUs')
translate('common.button.submit')
```

The shared configuration uses `keySeparator: '.'` and `nsSeparator: false`. Do not pass group names
such as `pages` to `useTranslation`, or use colon-prefixed keys such as `common:button.submit`.
Separate files such as `common.json` and `pages.json` are not loaded by the application.

If a string is reused across many pages (e.g. a button label like "Submit"), put it in `common`.
If it's specific to one page or feature, use the matching group.

## Key Naming Conventions

### Dotted paths and nested objects

Use camelCase names within nested objects. For example:

```json
{
  "common": {
    "button": {
      "returnToMain": "Return to Main Page"
    },
    "nav": {
      "profile": "Profile"
    }
  }
}
```

Look these up with `translate('common.button.returnToMain')` and `translate('common.nav.profile')`.

### Natural-language keys (`errors` group)

The error page uses the **full English sentence** as a key inside the `errors` object:

```json
{
  "errors": {
    "Page not found": "Page not found",
    "You are not currently authenticated": "You are not currently authenticated"
  }
}
```

Error messages are defined as plain strings in the server-side error classes
(`src/common/helpers/error.js`). The error page prefixes the message with `errors.` and
preserves the original message if no translation exists:

```jsx
translate(`errors.${error.message}`, {defaultValue: error.message})
```

Dynamic error keys cannot all be discovered by the extractor. Add their English entries manually.

## Interpolation (Dynamic Values)

To insert a variable into a translated string, use double curly braces `{{variableName}}`
in the locale file and pass the value as an option:

Locale file:
```json
{
  "common": {
    "greeting": "Hello, {{name}}!"
  }
}
```

Component:
```jsx
translate('common.greeting', {name: userName})
```

The shared `createI18n()` configuration sets `interpolation.escapeValue: false` because
React already escapes rendered text. This prevents characters such as `/`, `<`, or `&`
from being escaped twice; individual translation calls do not need this option.
If you insert translated strings directly into HTML outside React, escape them at that
output boundary.

## Adding a New Feature's Strings

Add a nested object to the appropriate group in `public/locales/en/translation.json`. For example,
a new page can use `pages.myPage` as shown above. If no existing group fits, add a new top-level
object to the same file. Neither case requires changing the i18n configuration or server loader.

Run `npm run parse-i18n` to extract keys from source files, then review the diff in
`public/locales/en/translation.json` and supply meaningful English text for new entries.
The extraction settings are in `i18next.config.js`; they write to the same single-file structure
used at runtime and retain existing keys (`removeUnusedKeys: false`).

For dynamically constructed keys, such as entity types or validation messages returned by helpers,
add every possible entry manually and verify it resolves. Extraction cannot infer every runtime key.
Do not edit the unused per-group JSON files or create new ones.

## Checklist Before Submitting

Before opening a PR that touches i18n, make sure:

 * All user-visible strings use `translate()`, no hardcoded English text
 * Keys are added to the appropriate nested group in `public/locales/en/translation.json`
 * Key names follow the naming convention of the target group
 * No duplicate keys — check if a shared key already exists under `common` first
 * `useTranslation` is destructured as `{t: translate}` (not `{t}`)
 * Calls use full dotted paths and `useTranslation()` without group names
 * Dynamically constructed keys have matching entries in the English catalog
 * Run `npm run parse-i18n` and review the resulting catalog changes
 * `npm run lint` passes with no new errors
