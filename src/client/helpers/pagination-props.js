/*
 * Copyright (C) 2018 Shivam Tripathi
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

// @flow

/*
 ______                _    ______              _
| ___ \              | |   | ___ \            (_)
| |_/ /  ___    ___  | | __| |_/ / _ __  __ _  _  _ __   ____
| ___ \ / _ \  / _ \ | |/ /| ___ \| '__|/ _` || || '_ \ |_  /
| |_/ /| (_) || (_) ||   < | |_/ /| |  | (_| || || | | | / /
\____/  \___/  \___/ |_|\_\\____/ |_|   \__,_||_||_| |_|/___|

*/

import _ from 'lodash';


type getPaginationPropsGeneratorType = {
	displayedPagesRange: number,
	itemsPerPage: number
};

/** Pagination::validateDefault - Validates, if invalid passed default
 * @param  {number} currentPage - The current active page
 * @param  {number} totalResults - Total number of results
 * @param {number} itemsPerPage - number of items per page
 * @returns {Object} - Returns an object encapsulating validated
 * 		currentPage, totalResults, totalPages
 */
function validatePaginationArgs(
	currentPage: number,
	totalResults: number,
	itemsPerPage: number
) {
	const totalPages: number = Math.ceil(totalResults / itemsPerPage);
	const args = {currentPage, totalPages, totalResults};
	if (!args.currentPage ||
		!_.isNumber(args.currentPage) ||
		args.currentPage < 1
	) {
		args.currentPage = 1;
	}

	if (!args.totalPages ||
		!_.isNumber(args.totalPages) ||
		args.totalPages < 1
	) {
		args.totalPages = 1;
		args.totalResults = itemsPerPage;
	}

	if (args.currentPage > args.totalPages) {
		args.currentPage = args.totalPages;
	}
	return args;
}

/** getPaginationPropsGenerator - Takes in number of pages and items per page,
 * 		defaults to 10, 25 and returns propsGenerator function
 * @param {object} args - encapsulates args
 * @param  {number} args.displayedPagesRange - Range of pages surrounding the
 * 		current page to be displayed
 * @param  {number} args.itemsPerPage - Number of items per page
 * @returns {function} - Returns a function which give pagination props given
 * 		currentPage and totalResults
 */
export default function getPaginationPropsGenerator(
	args: getPaginationPropsGeneratorType
) {
	const {displayedPagesRange = 10, itemsPerPage = 25} = args;

	/**
	 * @param  {number} totalRes - Total number of results
	 * @param  {number} curPage - Current page
	 * @returns {object} Returns result encapsulating pagination details
	 */
	return function getDetails(totalRes: number, curPage: number) {
		// Extract results, clean them up
		const {currentPage, totalPages, totalResults} =
			validatePaginationArgs(curPage, totalRes, itemsPerPage);

		// The first and last page links to be displayed, exactly halfway left
		//		and right from the currentpage
		const halfwayDistance: number =
			Math.floor(displayedPagesRange / 2);
		let firstPage: number = Math.max(1, currentPage - halfwayDistance);
		let lastPage: number =
			Math.min(totalPages, currentPage + halfwayDistance);

		// Incase number of pages lying in [firstPage, lastPage] are not
		//		covering the range due to being at extremes, we adjust the range
		const defaultRange: number = lastPage - firstPage + 1;
		const defaultDiffInRange = displayedPagesRange - defaultRange;
		if (defaultDiffInRange) {
			if (lastPage < totalPages) {
				lastPage = Math.min(lastPage + defaultDiffInRange, totalPages);
			}
			if (firstPage > 1) {
				firstPage = Math.max(firstPage - defaultDiffInRange, 1);
			}
		}

		// First result on current page
		const firstResultOnCurrentPage: number = _.clamp(
			displayedPagesRange * (currentPage - 1), 1, totalResults
		);
		const lastResultOnCurrentPage: number = _.clamp(
			displayedPagesRange * currentPage, 1, totalResults
		);

		return {
			beginningPage: 1,
			currentPage,
			endPage: totalPages,
			firstPage,
			firstResultOnCurrentPage,
			hasBeginningPage: totalPages > 1,
			hasEndPage: totalPages > 1,
			hasNextPage: currentPage < totalPages,
			hasPreviousPage: (currentPage - 1) > 0,
			itemsPerPage,
			lastPage,
			lastResultOnCurrentPage,
			nextPage: currentPage + 1,
			pagesRange: _.clamp(
				lastPage - firstPage + 1,
				1, totalPages
			),
			previousPage: currentPage - 1,
			resultsRange: _.clamp(
				lastResultOnCurrentPage - firstResultOnCurrentPage + 1,
				1, totalResults
			),
			totalPages,
			totalResults
		};
	};
}
