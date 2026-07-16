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

import React from 'react';
import {useTranslation} from 'react-i18next';


/**
 * Renders a page containing a link to the current MusicBrainz privacy
 * policy, which will form the basis of a future privacy policy
 * for BookBrainz.
 * @returns {JSX.Element} an element containing the rendered output
 */
function PrivacyPage(): JSX.Element {
	const {t: translate} = useTranslation(['staticPages', 'common']);

	return (
		<div>
			<div className="page-header">
				<h1>{translate('common:Privacy')}</h1>
			</div>
			<p>
				{translate('staticPages:privacy.p1Pre')}
				<a href="http://musicbrainz.org/doc/About/Privacy_Policy">
					http://musicbrainz.org/doc/About/Privacy_Policy
				</a>
			</p>

			<p>
				{translate('staticPages:privacy.p2')}
			</p>
		</div>
	);
}

PrivacyPage.displayName = 'PrivacyPage';

export default PrivacyPage;
