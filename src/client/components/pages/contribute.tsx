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
 * Renders the the document and displays the 'Contribute' page.
 * @returns {JSX.Element} a React JSX Element
 */
function ContributePage(): JSX.Element {
	const {t: translate} = useTranslation();
	const IRCLink = 'https://kiwiirc.com/nextclient/irc.libera.chat/?#bookbrainz';
	const styleLink = 'https://bookbrainz-user-guide.readthedocs.io/';

	return (
		<div>
			<div className="page-header">
				<h1>{translate('staticPages.contribute.title')}</h1>
			</div>
			<p className="lead">
				{translate('staticPages.contribute.lead')}
			</p>

			<h2>{translate('staticPages.contribute.editingTitle')}</h2>
			<p>
				{translate('staticPages.contribute.editingP1Pre')}<br/>
				{translate('staticPages.contribute.editingP1end')}&nbsp;
				<a href="/register">
					{translate('staticPages.contribute.registerLinkText')}
				</a>
				{translate('staticPages.contribute.editingP1Post')}
			</p>
			<p>
				{translate('staticPages.contribute.editingP2Pre')}&nbsp;
				<a href={styleLink}>
					{translate('staticPages.contribute.guidelines')}
				</a>
				{translate('staticPages.contribute.editingP2End')}<br/>
				{translate('staticPages.contribute.editingP2Mid')}&nbsp;
				<a href="http://musicbrainz.org/doc/Style">
					{translate('staticPages.contribute.musicbrainzStyleLinkText')}
				</a>
				{translate('staticPages.contribute.editingP2Post')}
			</p>
			<p>
				{translate('staticPages.contribute.editingP3Pre')}&nbsp;
				<a href="https://bookbrainz-user-guide.readthedocs.io/en/latest/tutorials/merging.html">
					{translate('staticPages.contribute.mergeTutorialLinkText')}
				</a>
				{translate('staticPages.contribute.editingP3Post')}
			</p>

			<h2>{translate('staticPages.contribute.programmingTitle')}</h2>
			<p>
				{translate('staticPages.contribute.programmingP1Pre')}&nbsp;
				<a href="https://wiki.musicbrainz.org/Development/Priorities#BookBrainz">
					{translate('staticPages.contribute.roadmapLinkText')}
				</a>
				{translate('staticPages.contribute.programmingP1Mid')}&nbsp;
				<a href="https://github.com/metabrainz?q=bookbrainz">
					{translate('common.Ongithub')}
				</a>
			</p>

			<h2>{translate('staticPages.contribute.communityTitle')}</h2>
			<p>
				{translate('staticPages.contribute.communityP1Pre')}&nbsp;
				<a href={IRCLink}>
					{translate('common.ircChannel')}
				</a>
				{translate('staticPages.contribute.communityP1Post')}
			</p>
			<p>
				{translate('staticPages.contribute.communityP2Pre')}
				<a href="https://community.metabrainz.org/c/bookbrainz">
					{translate('common.Onforums')}
				</a>
				{translate('staticPages.contribute.communityP2Mid')}
				<a href="mailto:bookbrainz@metabrainz.org">
					{translate('common.Anemail')}.
				</a>
			</p>
		</div>
	);
}

ContributePage.displayName = 'ContributePage';

export default ContributePage;
