/*
 * Copyright (C) 2015  Ben Ockmore
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

import React from 'react';


const {Col, Row} = bootstrap;

/**
 * Renders a page containing information about the licensing and copyrights for the content available on the Bookbrainz.
 * @returns {JSX.Element} a React JSX Component
 */
function LicensingPage(): JSX.Element {
	const CC0Link = 'http://creativecommons.org/publicdomain/zero/1.0/';
	const CC0Image = 'http://i.creativecommons.org/p/zero/1.0/88x31.png';

	const CCBYSALink = 'http://creativecommons.org/licenses/by-sa/4.0/';
	const CCBYSAImage =
		'https://i.creativecommons.org/l/by-sa/4.0/88x31.png';

	return (
		<div>
			<div className="page-header">
				<h1>Licensing</h1>
			</div>

			<p>The BookBrainz core data is licensed under the&nbsp;
				<a href={CC0Link}>
					Creative Commons CC0
				</a> license. The core data includes the following
				information:
			</p>

			<ul>
				<li>
					<b>Author</b>&nbsp;
					BBID, aliases, type, begin and end dates, gender and
					disambiguation comment
				</li>
				<li>
					<b>Edition Group</b>&nbsp;
					BBID, aliases, type and disambiguation comment
				</li>
				<li>
					<b>Edition</b>&nbsp;
					BBID, aliases, begin and end dates, language, status
					and disambiguation comment
				</li>
				<li>
					<b>Publisher</b>&nbsp;
					BBID, aliases, type, begin and end dates and
					disambiguation comment
				</li>
				<li>
					<b>Work</b>&nbsp;
					BBID, aliases, languages, type, disambiguation comment
				</li>
				<li>
					<b>Relationship</b>&nbsp;
					ID, type, and entity and text associations
				</li>
			</ul>

			<p>
				Other publically available data is licensed under the&nbsp;
				<a href={CCBYSALink}>
					Creative Commons CC BY-SA
				</a> license. If you have any queries about licensing of
				the public data, please <a href="mailto:bookbrainz@metabrainz.org">ask for clarification</a>.
				Please see the links below for more details about CC0 and CC BY-SA.
			</p>

			<Row className="margin-top-2">
				<Col className="text-center" lg={{offset: 2, span: 4}}>
					<a
						href={CC0Link}
						rel="license"
					>
						<div>
							<img
								alt="CC0"
								src={CC0Image}
							/>
						</div>
						CC0
					</a>
				</Col>
				<Col className="text-center" lg={4}>
					<a
						href={CCBYSALink}
						rel="license"
					>
						<div>
							<img
								alt="Creative Commons License"
								src={CCBYSAImage}
							/>
						</div>
						CC BY-SA
					</a>
				</Col>
			</Row>
		</div>
	);
}

LicensingPage.displayName = 'LicensingPage';

export default LicensingPage;
