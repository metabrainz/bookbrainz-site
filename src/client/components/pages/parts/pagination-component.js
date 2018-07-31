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

import * as bootstrap from 'react-bootstrap';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';


const {Pagination, Button} = bootstrap;
const {Item} = Pagination;

function getPaginationItem({
	active,
	content,
	handleClick,
	link,
	pageNumber
}) {
	function onClick() {
		handleClick(pageNumber);
	}
	return (
		<Item
			active={active}
			href={link}
			key={content}
			onClick={onClick}
		>
			{content}
		</Item>
	);
}

getPaginationItem.propTypes = {
	active: PropTypes.bool.isRequired,
	content: PropTypes.string.isRequired,
	handleClick: PropTypes.func.isRequired,
	link: PropTypes.string.isRequired,
	pageNumber: PropTypes.number.isRequired
};

function PaginationComponent({
	currentPage,
	firstPage,
	lastPage,
	linkGenerator,
	hasPreviousPage,
	previousPage,
	hasNextPage,
	nextPage,
	hasBeginningPage,
	beginningPage,
	hasEndPage,
	endPage,
	handleClick
}) {
	const items = [];
	if (hasBeginningPage) {
		const link = linkGenerator(beginningPage);
		items.push(getPaginationItem(
			{active: false, content: '<<', handleClick, link,
				pageNumber: beginningPage}
		));
	}

	if (hasPreviousPage) {
		items.push(getPaginationItem(
			{active: false, content: '<', handleClick,
				link: linkGenerator(previousPage), pageNumber: previousPage}
		));
	}
	_.range(firstPage, lastPage).forEach(pageNumber => {
		const active = pageNumber === currentPage;
		items.push(getPaginationItem(
			{active, content: pageNumber.toString(), handleClick,
				link: linkGenerator(pageNumber), pageNumber}
		));
	});

	if (hasNextPage) {
		items.push(getPaginationItem(
			{active: false, content: '>', handleClick,
				link: linkGenerator(nextPage), pageNumber: nextPage}
		));
	}

	if (hasEndPage) {
		items.push(getPaginationItem(
			{active: false, content: '>>', handleClick,
				link: linkGenerator(endPage), pageNumber: endPage}
		));
	}

	return <Pagination bsSize="medium"> {items} </Pagination>;
}

PaginationComponent.displayName = 'PaginationComponent';
PaginationComponent.propTypes = {
	beginningPage: PropTypes.number.isRequired,
	currentPage: PropTypes.number.isRequired,
	endPage: PropTypes.number.isRequired,
	firstPage: PropTypes.number.isRequired,
	handleClick: PropTypes.func.isRequired,
	hasBeginningPage: PropTypes.bool.isRequired,
	hasEndPage: PropTypes.bool.isRequired,
	hasNextPage: PropTypes.bool.isRequired,
	hasPreviousPage: PropTypes.bool.isRequired,
	lastPage: PropTypes.number.isRequired,
	linkGenerator: PropTypes.func,
	nextPage: PropTypes.number.isRequired,
	previousPage: PropTypes.number.isRequired
};

PaginationComponent.defaultProps = {
	linkGenerator: () => '#'
};

export default PaginationComponent;
