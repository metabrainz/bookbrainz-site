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
				<Trans
					components={{lineBreak: <br/>, registerLink: <a href="/register"/>}}
					i18nKey="staticPages.contribute.editingP1"
				/>
			</p>
			<p>
				<Trans
					components={{
						guidelinesLink: <a href={styleLink}/>,
						lineBreak: <br/>,
						musicbrainzStyleLink: <a href="http://musicbrainz.org/doc/Style"/>
					}}
					i18nKey="staticPages.contribute.editingP2"
				/>
			</p>
			<p>
				<Trans
					components={{
						tutorialLink: <a href="https://bookbrainz-user-guide.readthedocs.io/en/latest/tutorials/merging.html"/>
					}}
					i18nKey="staticPages.contribute.editingP3"
				/>
			</p>

			<h2>{translate('staticPages.contribute.programmingTitle')}</h2>
			<p>
				<Trans
					components={{
						githubLink: <a href="https://github.com/metabrainz?q=bookbrainz"/>,
						roadmapLink: <a href="https://wiki.musicbrainz.org/Development/Priorities#BookBrainz"/>
					}}
					i18nKey="staticPages.contribute.programmingP1"
				/>
			</p>

			<h2>{translate('staticPages.contribute.communityTitle')}</h2>
			<p>
				<Trans
					components={{ircLink: <a href={IRCLink}/>}}
					i18nKey="staticPages.contribute.communityP1"
				/>
			</p>
			<p>
				<Trans
					components={{
						emailLink: <a href="mailto:bookbrainz@metabrainz.org"/>,
						forumsLink: <a href="https://community.metabrainz.org/c/bookbrainz"/>
					}}
					i18nKey="staticPages.contribute.communityP2"
				/>
			</p>
		</div>
	);
}

ContributePage.displayName = 'ContributePage';

export default ContributePage;
