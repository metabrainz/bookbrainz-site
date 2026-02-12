export interface RecentlyUsedItem{
    id: number | string;
    name: string;
}

export interface EntityWithType {
    type?: string;
    id?: number | string;
    text?: string;
}

export const RecentlyUsed = {
	addItem: (entityType: string, item: RecentlyUsedItem): void => {
		if (typeof window === 'undefined') { return; }
		try {
			const current = RecentlyUsed.getItems(entityType);
			const filtered = current.filter(i => i.id !== item.id);
			const updatedList = [item, ...filtered].slice(0, 10);
			localStorage.setItem(`recently_used_${entityType}`, JSON.stringify(updatedList));
		}
		catch (error) {
			// eslint-disable-next-line no-console
			console.error('Error writing to localStorage:', error);
		}
	},
	addItemToRecentlyUsed: (entity: EntityWithType): void => {
		if (entity && entity.type && entity.id && entity.text) {
			RecentlyUsed.addItem(entity.type, {
				id: entity.id,
				name: entity.text
			});
		}
	},
	clearItems: (entityType: string): void => {
		if (typeof window === 'undefined') { return; }
		localStorage.removeItem(`recently_used_${entityType}`);
	},
	getItems: (entityType: string): RecentlyUsedItem[] => {
		if (typeof window === 'undefined') {
			return [];
		}
		try {
			return JSON.parse(localStorage.getItem(`recently_used_${entityType}`)) || [];
		}
		catch (error) {
			// eslint-disable-next-line no-console
			console.error('Error reading from localStorage:', error);
			return [];
		}
	}
};
