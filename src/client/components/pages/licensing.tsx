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

import {Trans, useTranslation} from 'react-i18next';
import React from 'react';


const {Col, Row} = bootstrap;

/**
 * Renders a page containing information about the licensing and copyrights for the content available on the Bookbrainz.
 * @returns {JSX.Element} a React JSX Component
 */
function LicensingPage(): JSX.Element {
	const {t: translate} = useTranslation();
	const CC0Link = 'http://creativecommons.org/publicdomain/zero/1.0/';
	const CC0Image = 'http://i.creativecommons.org/p/zero/1.0/88x31.png';

	const CCBYSALink = 'http://creativecommons.org/licenses/by-sa/4.0/';
	const CCBYSAImage =
		'https://i.creativecommons.org/l/by-sa/4.0/88x31.png';

	return (
		<div>
			<div className="page-header">
				<h1>{translate('pages.licensing.heading')}</h1>
			</div>

			<p>
				<Trans
					components={{cc0Link: <a href={CC0Link}/>}}
					i18nKey="pages.licensing.coreDataNotice"
				/>
			</p>

			<ul>
				<li>
					<b>{translate('common.entityType.author')}</b>&nbsp;
					{translate('pages.licensing.coreAuthor')}
				</li>
				<li>
					<b>{translate('common.entityType.editionGroup')}</b>&nbsp;
					{translate('pages.licensing.coreEditionGroup')}
				</li>
				<li>
					<b>{translate('common.entityType.edition')}</b>&nbsp;
					{translate('pages.licensing.coreEdition')}
				</li>
				<li>
					<b>{translate('common.entityType.publisher')}</b>&nbsp;
					{translate('pages.licensing.corePublisher')}
				</li>
				<li>
					<b>{translate('common.entityType.work')}</b>&nbsp;
					{translate('pages.licensing.coreWork')}
				</li>
				<li>
					<b>{translate('common.relationship')}</b>&nbsp;
					{translate('pages.licensing.coreRelationship')}
				</li>
			</ul>

			<p>
				<Trans
					components={{
						askLink: <a href="mailto:bookbrainz@metabrainz.org"/>,
						ccBySaLink: <a href={CCBYSALink}/>
					}}
					i18nKey="pages.licensing.publicDataNotice"
				/>
			</p>

			<Row className="margin-top-2">
				<Col className="text-center" lg={{offset: 2, span: 4}}>
					<a
						href={CC0Link}
						rel="license"
					>
						<div>
							<img
								alt={translate('pages.licensing.cc0Alt')}
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
								alt={translate('pages.licensing.ccBySaAlt')}
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
