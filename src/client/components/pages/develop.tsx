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

import {Trans, useTranslation} from 'react-i18next';
import React from 'react';


/**
 * Renders the document and displays the 'Develop' page.
 * @returns {JSX.Element} a React JSX Element
 */
function DevelopPage(): JSX.Element {
	const {t: translate} = useTranslation();
	return (
		<div>
			<div className="page-header">
				<h1>{translate('pages.develop.heading')}</h1>
			</div>
			<p className="lead">
				{translate('pages.develop.lead')}
			</p>
			<h2>{translate('pages.develop.webServiceHeading')}</h2>
			<p>
				<Trans
					components={{docsLink: <a href="https://api.test.bookbrainz.org/1/docs/"/>}}
					i18nKey="pages.develop.webServiceText"
				/>
			</p>

			<h2>{translate('pages.develop.dumpsHeading')}</h2>
			<p>
				<Trans
					components={{dumpLink: <a href="ftp://ftp.musicbrainz.org/pub/musicbrainz/bookbrainz/latest.sql.bz2"/>}}
					i18nKey="pages.develop.dumpsText"
				/>
			</p>
			<h2>{translate('pages.develop.sourceHeading')}</h2>
			<p>
				<Trans
					components={{githubLink: <a href="https://github.com/metabrainz/bookbrainz-site"/>}}
					i18nKey="pages.develop.sourceText"
				/>
			</p>
		</div>
	);
}

DevelopPage.displayName = 'DevelopPage';

export default DevelopPage;
