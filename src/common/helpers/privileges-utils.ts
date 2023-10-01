/* eslint-disable sort-keys */
export const PRIVILEGE_PROPERTIES = {
	0: {
		title: 'Entity Editor',
		badgeVariant: 'secondary'
	},
	1: {
		title: 'Identifier Type Editor',
		badgeVariant: 'warning'
	},
	2: {
		title: 'Relationship Type Editor',
		badgeVariant: 'info'
	},
	3: {
		title: 'Reindex Search Engine',
		badgeVariant: 'success'
	},
	4: {
		title: 'Administrator',
		badgeVariant: 'danger'
	}
};

export enum PrivilegeType {
	ADMIN = 16,
	REINDEX_SEARCH_SERVER = 8,
	RELATIONSHIP_TYPE_EDITOR = 4,
	IDENTIFIER_TYPE_EDITOR = 2,
	ENTITY_EDITOR = 1
}

export enum AdminActionType {
	CHANGE_PRIV = 'Change Privileges'
}

export const PrivilegeTypes = {
	ADMIN_PRIV: {
		bit: 4,
		value: PrivilegeType.ADMIN
	},
	REINDEX_SEARCH_SERVER_PRIV: {
		bit: 3,
		value: PrivilegeType.REINDEX_SEARCH_SERVER
	},
	RELATIONSHIP_TYPE_EDITOR_PRIV: {
		bit: 2,
		value: PrivilegeType.RELATIONSHIP_TYPE_EDITOR
	},
	IDENTIFIER_TYPE_EDITOR_PRIV: {
		bit: 1,
		value: PrivilegeType.IDENTIFIER_TYPE_EDITOR
	},
	ENTITY_EDITOR_PRIV: {
		bit: 0,
		value: PrivilegeType.ENTITY_EDITOR
	}
};

/* eslint-disable no-bitwise */
/**
 * Retrieves the icon for the shield depending on the privileges that the user has
 *
 * @param {number} privs - the privileges of the user
 * @returns {string} - returns a string which contains the location of the PrivilegeShield Icon
 */
export function getPrivilegeShieldIcon(privs: number) {
	// if the user has admin privilege
	if (privs & PrivilegeTypes.ADMIN_PRIV.value) {
		return '/images/icons/shield-check-orange-filled.svg';
	}
	// if the user has some special privileges, but not the admin privilege
	else if (privs > 1) {
		return '/images/icons/shield-orange-center.svg';
	}
	// if the user has no privileges
	else if (privs === 0) {
		return '/images/icons/shield-white-center.svg';
	}
	// if the user has only the Entity-editor privilege
	return '/images/icons/shield-grey-center.svg';
}

/**
 * Returns whether the user has a particular Privilege or not
 *
 * @param {number} privs - the privileges of the user
 * @param {PrivilegeType} privType - the privilege type being checked
 * @returns {boolean} - whether the user has the privilege type or not
 */
export function checkPrivilege(privs: number, privType: PrivilegeType) {
	return Boolean(privs & privType);
}

export function getPrivilegeTitleFromBit(bit: number) {
	return PRIVILEGE_PROPERTIES[bit].title;
}

export function getBadgeVariantFromBit(bit: number) {
	return PRIVILEGE_PROPERTIES[bit].badgeVariant;
}

/**
 * Retrieves the bits of all the privileges set in the privs variable
 *
 * @param {number} privs - the privileges of the user
 * @throws {Error} Throws a custom error if there is some unsupported privilege type
 * @returns {Array} - returns an array of containing the bits of all the privileges the user has set
 */
export function getPrivilegeBitsArray(privs: number): any {
	const PrivBits = Object.values(PrivilegeTypes).filter(priv => privs & (1 << priv.bit)).map(priv => priv.bit);
	const maxBits = Object.keys(PrivilegeTypes).length;

	if (privs >= (1 << maxBits)) {
		throw new Error(`Unsupported set of Privileges: '${privs}'`);
	}
	return PrivBits;
}
