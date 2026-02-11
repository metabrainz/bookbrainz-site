/* eslint-disable no-console */
export interface RecentlyUsedItem{
    id: number;
    name: string;
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
			console.error('Error writing to localStorage:', error);
		}
	},
	clearItems: (entityType: string): void => {
		if (typeof window === 'undefined') { return; }
		localStorage.removeItem(`recently_used_${entityType}`);
	},
	getItems: (entityType: string): RecentlyUsedItem[] => {
		if (typeof window === 'undefined') { return []; }
		try {
			return JSON.parse(localStorage.getItem(`recently_used_${entityType}`)) || [];
		}
		catch (error) {
			console.error('Error reading from localStorage:', error);
			return [];
		}
	}
};
