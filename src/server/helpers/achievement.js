/*
 * Copyright (C) 2016  Max Prettyjohns
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

'use strict';
const Bookshelf = require('./bookshelf');
const AchievementType = require('bookbrainz-data').AchievementType;
const AchievementUnlock = require('bookbrainz-data').AchievementUnlock;

const achievement = {};

function entityCreation() {
	//get number of entities created
	var entitiesCreated = 0;
	if (entitiesCreated > 50) {
		creator = new AchievementType({name: "Creator III"});
		checkAchievementAwarded(user, creator);
	}
	if (entitiesCreated > 0) {
		creator = new AchievementType({name: "Creator I"});
		checkAchievementAwarded(user, creator);
	}
}

function checkAchievementAwarded(editor, achievement) {
	new AchievementUnlock({editor_id: editor.id, achievement_id: achievement.id})
		.fetch()
		.then((unlock) => {
			if (unlock != null) {
				return true;
			}
			else {
				return false;
			}
		});
}

achievement.processPageVisit = () => {
	
};

achievement.processEdit = () => {
	entityCreation();
	
};

achievement.processComment = () => {

};

module.exports = achievement;
