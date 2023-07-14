/*
 * Copyright (C) 2023 Shivam Awasthi
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import * as React from 'react';
import {AdminActionType, PrivilegeTypes, getPrivilegeTitleFromBit} from '../../common/helpers/privileges-utils';
import {sanitize} from 'isomorphic-dompurify';


/* eslint-disable no-bitwise */
function getPrivsAdded(newPrivs, oldPrivs) {
	const privsAdded = [];
	const totalBits = Object.keys(PrivilegeTypes).length;

	for (let i = 0; i < totalBits; i++) {
		if (!(oldPrivs & (1 << i)) && (newPrivs & (1 << i))) {
			privsAdded.push(getPrivilegeTitleFromBit(i));
		}
	}

	return privsAdded;
}

function getPrivsRemoved(newPrivs, oldPrivs) {
	const privsRemoved = [];
	const totalBits = Object.keys(PrivilegeTypes).length;

	for (let i = 0; i < totalBits; i++) {
		if (!(newPrivs & (1 << i)) && (oldPrivs & (1 << i))) {
			privsRemoved.push(getPrivilegeTitleFromBit(i));
		}
	}

	return privsRemoved;
}

function constructPrivsChangeStatement(logData) {
	const {newPrivs, oldPrivs, targetUserId, targetUser, adminId, admin} = logData;
	const privsAdded = getPrivsAdded(newPrivs, oldPrivs);
	const privsRemoved = getPrivsRemoved(newPrivs, oldPrivs);

	let grantStatement = '';
	if (privsAdded.length) {
		grantStatement = ' granted ';
		for (let i = 0; i < privsAdded.length; i++) {
			if (i !== 0 && i === privsAdded.length - 1) {
				grantStatement += ' and ';
				grantStatement += `<strong>${privsAdded[i]}</strong>`;
			}
			else if (i !== 0) {
				grantStatement += ', ';
				grantStatement += `<strong>${privsAdded[i]}</strong>`;
			}
			else {
				grantStatement += `<strong>${privsAdded[i]}</strong>`;
			}
		}
		grantStatement += ' privilege';
		if (privsAdded.length > 1) {
			grantStatement += 's';
		}
	}
	const andStatement = privsAdded.length && privsRemoved.length ? ' and' : '';

	let removedStatement = '';
	if (privsRemoved.length) {
		removedStatement = ' removed ';
		for (let i = 0; i < privsRemoved.length; i++) {
			if (i !== 0 && i === privsRemoved.length - 1) {
				removedStatement += ' and ';
				removedStatement += `<strong>${privsRemoved[i]}</strong>`;
			}
			else if (i !== 0) {
				removedStatement += ', ';
				removedStatement += `<strong>${privsRemoved[i]}</strong>`;
			}
			else {
				removedStatement += `<strong>${privsRemoved[i]}</strong>`;
			}
		}
		removedStatement += ' privilege';
		if (privsRemoved.length > 1) {
			removedStatement += 's';
		}
	}

	const preposition = privsRemoved.length ? ' from ' : ' to ';

	const finalStatement = grantStatement + andStatement + removedStatement + preposition;
	/* eslint-disable react/no-danger */
	// We are disabling this rule because we are already sanitizing the html here
	return (
		<div>
			<a href={`/editor/${adminId}`}>
				{admin.name}
			</a>
			<span dangerouslySetInnerHTML={{__html: sanitize(finalStatement)}}/>
			<a href={`/editor/${targetUserId}`}>
				{targetUser.name}
			</a>.
		</div>
	);
}

/**
 * Constructs a log statement for each administrative action for the Admin Logs Page
 * @function constructAdminLogStatement
 * @param {object} logData - the data for the admin log action
 * @returns {string} A statement of the log depending upon the AdminActionType
 */
export function constructAdminLogStatement(logData) {
	if (logData.actionType === AdminActionType.CHANGE_PRIV) {
		return constructPrivsChangeStatement(logData);
	}
	return '';
}
