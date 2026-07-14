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

import {faCircle, faCommentDots, faComments, faEnvelope} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import React from 'react';
import {faXTwitter} from '@fortawesome/free-brands-svg-icons';
import {useTranslation} from 'react-i18next';


/**
 * Renders the document and displays the 'About' page.
 * @returns {JSX.Element} a React JSX Element
 * page
 */
function AboutPage(): JSX.Element {
	const {t: translate} = useTranslation(['staticPages', 'common']);
	const NESLink =
		'https://ocharles.org.uk/blog/posts/' +
			'2012-07-10-nes-does-it-better-1.html';

	return (
		<div>
			<div className="page-header"><h1>{translate('common:about.title')}</h1></div>
			<p className="lead">
				{translate('common:about.lead')}
			</p>

			<p>
				{translate('staticPages:about.welcomeMessage')}&nbsp;
				<a href="/register">
					{translate('staticPages:about.becomeEditor')}
				</a>
			</p>

			<p>
				{translate('staticPages:about.contributionsNotice')}
			</p>

			<h2>{translate('common:about.accessingData')}</h2>
			<p>
				{translate('staticPages:about.dataLicensePre')}
				<a href="/licensing">
					 {translate('staticPages:about.licensingPageLink')}
				</a>
				{translate('staticPages:about.dataLicensePost')}
			</p>
			<p>
				{translate('staticPages:about.dbDumpsPre')}
				<a href="http://ftp.musicbrainz.org/pub/musicbrainz/bookbrainz/latest.sql.bz2">
					{translate('staticPages:about.dbDumpsLink')}
				</a>
			</p>
			<p>
				{translate('staticPages:about.webservicePre')}
				<a href="https://api.bookbrainz.org/1/docs/">
					{translate('staticPages:about.webserviceLink')}
				</a>.
			</p>

			<h2>{translate('common:about.contactUs')}</h2>
			<div style={{
				alignItems: 'center',
				display: 'flex',
				justifyContent: 'space-evenly'
			}}
			>
				<FontAwesomeIcon
					className="margin-sides-1 contact-text"
					icon={faCircle}
				/>
				<a className="contact-text" href="https://musicbrainz.org/doc/Communication/ChatBrainz">
					<FontAwesomeIcon
						className="contact-text"
						icon={faCommentDots}
						size="2x"
					/>
					{translate('staticPages:about.chatWithUs')}<br/>
					<small>{translate('staticPages:about.chatChannels')}</small>
				</a>
				<FontAwesomeIcon
					className="margin-sides-1 contact-text"
					icon={faCircle}
				/>
				<a className="contact-text" href="//community.metabrainz.org/c/bookbrainz">
					<FontAwesomeIcon
						className="contact-text"
						icon={faComments}
						size="2x"
					/>
					{translate('common:forums')}
				</a>
				<FontAwesomeIcon
					className="margin-sides-1 contact-text"
					icon={faCircle}
				/>
				<a className="contact-text" href="https://x.com/BookBrainz">
					<FontAwesomeIcon
						className="contact-text"
						icon={faXTwitter}
						size="2x"
					/>
					{translate('staticPages:about.x')}
				</a>
				<FontAwesomeIcon
					className="margin-sides-1 contact-text"
					icon={faCircle}
				/>
				<a className="contact-text" href="mailto:bookbrainz@metabrainz.org">
					<FontAwesomeIcon
						className="contact-text"
						icon={faEnvelope}
						size="2x"
					/>
					{translate('common:email')}
				</a>
				<FontAwesomeIcon
					className="margin-sides-1 contact-text"
					icon={faCircle}
				/>
			</div>

			<h2>{translate('common:about.ourStory')}</h2>
			<p>
				{translate('staticPages:about.storyPart1Pre')}&nbsp;
				<a href="https://github.com/ocharles">
					 {translate('staticPages:about.oliver')}
				</a>
				{translate('staticPages:about.storyPart1Mid')}
			</p>

			<p>
				{translate('staticPages:about.storyPart2Pre')}&nbsp;
				<a href="https://github.com/Leftmostcat">
					{translate('staticPages:about.sean')}
				</a>
				{translate('staticPages:about.storyPart2Mid')}
			</p>

			<p>
				{translate('staticPages:about.storyPart3Pre')}&nbsp;
				<a href="https://github.com/LordSputnik">
					{translate('staticPages:about.ben')}
				</a>
				{translate('staticPages:about.storyPart3Mid')}
			</p>

			<p>
				{translate('staticPages:about.storyPart4Pre')}&nbsp;
				<a href="https://github.com/MonkeyDo">
					{translate('staticPages:about.monkey')}
				</a>
				{translate('staticPages:about.storyPart4Mid')}
			</p>

			<p>
				{translate('staticPages:about.storyPart5Pre')}
				<a href={NESLink}>
					{translate('staticPages:about.storyPart5Link')}
				</a>
				{translate('staticPages:about.storyPart5Post')}
			</p>
		</div>
	);
}

AboutPage.displayName = 'AboutPage';

export default AboutPage;
