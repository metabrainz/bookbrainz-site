export type SiteUser = {
	id: number,
	name: string,
	privs: number
};

export type Alert = {
	level: 'danger' | 'info' | 'success' | 'warning',
	message: string
};

export type MergeEntity = {
	bbid: string,
	type: string
};

export type MergeQueue = {
	entityType: string,
	mergingEntities: Record<string, MergeEntity>,
	seriesEntityType: string | null
};

// What the MetaBrainz login reported about someone who has no BookBrainz account yet
export type MetaBrainzProfile = {
	gender?: string,
	username?: string
};

export type SiteSession = {
	mbProfile?: MetaBrainzProfile,
	mergeQueue?: MergeQueue | null,
	redirectTo?: string
};
