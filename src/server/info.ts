
export const repositoryName = 'bookbrainz-site';

export const version = process.env.GIT_COMMIT_SHA || 'latest';

export const domain = 'bookbrainz.org';

export const userAgent = `${repositoryName}/${version} (${domain})`;
