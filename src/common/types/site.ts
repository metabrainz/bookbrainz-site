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

export type SiteSession = {
	mergeQueue?: MergeQueue | null,
	redirectTo?: string
};
