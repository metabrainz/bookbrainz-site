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

const AchievementType = require('bookbrainz-data').AchievementType;
const AchievementUnlock = require('bookbrainz-data').AchievementUnlock;
const achievement = {};

function awardAchievement(editorid, achievementId) {
	return new AchievementUnlock({
		editorId: editorid,
		achievementId
	})
		.save(null, {method: 'insert'})
		.then((unlock) => {
			return unlock;
		});
}

function processRevisionist(editorId) {
	return new AchievementType({name: 'Revisionist I'})
		.fetch()
		.then((revisionist) =>
			awardAchievement(editorId, revisionist.id)
		);
}


achievement.processPageVisit = () => {

};

achievement.processEdit = (userid) =>
	processRevisionist(userid);

achievement.processComment = () => {

};

module.exports = achievement;
