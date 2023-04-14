
export const repositoryName = 'bookbrainz-site';

export const repositoryUrl = 'https://github.com/metabrainz/bookbrainz-site/';

// eslint-disable-next-line node/no-process-env
export const siteRevision = process.env.GIT_COMMIT_SHA;

// In production, a git tag (e.g. `v0.15.2` or `v-2023-02-20.0`) might be passed instead of a commit SHA.
// Try to extract the plain version number (e.g. `0.15.2` or `2023-02-20.0`) from the git specifier.
// Otherwise we assume that a development server is running and use `dev` as the version.
export const version = siteRevision?.match(/^v-?([\d.-]+)$/)?.[1] ?? 'dev';

export const domain = 'bookbrainz.org';

export const userAgent = `${repositoryName}/${version} (${domain})`;
