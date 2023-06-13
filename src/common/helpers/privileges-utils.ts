/* eslint-disable sort-keys */
export const PrivilegeTypes = {
	ADMIN_PRIV: 16,
	REINDEX_SEARCH_SERVER_PRIV: 8,
	RELATIONSHIP_TYPE_EDITOR_PRIV: 4,
	IDENTIFIER_TYPE_EDITOR_PRIV: 2,
	ENTITY_EDITING_PRIV: 1
};

export const PrivilegeTypeBits = {
	ADMIN_PRIV: 4,
	REINDEX_SEARCH_SERVER_PRIV: 3,
	RELATIONSHIP_TYPE_EDITOR_PRIV: 2,
	IDENTIFIER_TYPE_EDITOR_PRIV: 1,
	ENTITY_EDITING_PRIV: 0
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
	if (privs & PrivilegeTypes.ADMIN_PRIV) {
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

export function getPrivilegeTitleFromBit(bit: number) {
	const privTypes = {
		0: 'Entity Editor',
		1: 'Identifier Type Editor',
		2: 'Relationship Type Editor',
		3: 'Reindex Search Engine',
		4: 'Administrator'
	};

	return privTypes[bit];
}

export function getBadgeVariantFromTitle(title: string) {
	const variants = {
		'Entity Editor': 'secondary',
		'Identifier Type Editor': 'warning',
		'Relationship Type Editor': 'info',
		'Reindex Search Engine': 'success',
		Administrator: 'danger'
	};

	return variants[title];
}

/**
 * Retrieves the titles of all the privileges contained in the privs variable
 *
 * @param {number} privs - the privileges of the user
 * @throws {Error} Throws a custom error if there is some unsupported privilege type
 * @returns {Array} - returns an array of containing the titles of all the privileges the user has
 */
export function getPrivilegeTitlesArray(privs: number): any {
	const PrivTitles = Object.values(PrivilegeTypeBits).filter(bit => privs & (1 << bit)).map(bit => getPrivilegeTitleFromBit(bit));
	const maxBits = Object.keys(PrivilegeTypeBits).length;

	if (privs >= (1 << maxBits)) {
		throw new Error(`Unsupported set of Privileges: '${privs}'`);
	}
	return PrivTitles;
}
