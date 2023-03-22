
export const repositoryName = 'bookbrainz-site';

export const siteRevision = process.env.GIT_COMMIT_SHA;

// In production, a git tag (e.g. `v0.15.2` or `v-2023-02-20.0`) might be passed instead of a commit SHA.
// Try to extract the plain version number (e.g. `0.15.2` or `2023-02-20.0`) from the git specifier.
export const version = siteRevision?.match(/^v-?([\d.-]+)$/)?.[1] ?? 'latest';

export const domain = 'bookbrainz.org';

export const userAgent = `${repositoryName}/${version} (${domain})`;
