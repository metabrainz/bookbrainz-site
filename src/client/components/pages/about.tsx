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
import {faCircle, faCommentDots, faComments, faEnvelope} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import React from 'react';
import {faXTwitter} from '@fortawesome/free-brands-svg-icons';


/**
 * Renders the document and displays the 'About' page.
 * @returns {JSX.Element} a React JSX Element
 * page
 */
function AboutPage(): JSX.Element {
	const {t: translate} = useTranslation();
	const NESLink =
		'https://ocharles.org.uk/blog/posts/' +
			'2012-07-10-nes-does-it-better-1.html';

	return (
		<div>
			<div className="page-header"><h1>{translate('common.about.title')}</h1></div>
			<p className="lead">
				{translate('common.about.lead')}
			</p>

			<p>
				<Trans
					components={{registerLink: <a href="/register"/>}}
					i18nKey="staticPages.about.welcomeMessage"
				/>
			</p>

			<p>
				{translate('staticPages.about.contributionsNotice')}
			</p>

			<h2>{translate('common.about.accessingData')}</h2>
			<p>
				<Trans
					components={{licensingLink: <a href="/licensing"/>}}
					i18nKey="staticPages.about.dataLicense"
				/>
			</p>
			<p>
				<Trans
					components={{
						downloadLink: <a href="http://ftp.musicbrainz.org/pub/musicbrainz/bookbrainz/latest.sql.bz2"/>
					}}
					i18nKey="staticPages.about.dbDumps"
				/>
			</p>
			<p>
				<Trans
					components={{documentationLink: <a href="https://api.bookbrainz.org/1/docs/"/>}}
					i18nKey="staticPages.about.webservice"
				/>
			</p>

			<h2>{translate('common.about.contactUs')}</h2>
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
					<Trans
						components={{channels: <small/>, lineBreak: <br/>}}
						i18nKey="staticPages.about.chatWithUs"
					/>
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
					{translate('common.forums')}
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
					{translate('staticPages.about.x')}
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
					{translate('common.anEmail')}
				</a>
				<FontAwesomeIcon
					className="margin-sides-1 contact-text"
					icon={faCircle}
				/>
			</div>

			<h2>{translate('common.about.ourStory')}</h2>
			<p>
				<Trans
					components={{oliverLink: <a href="https://github.com/ocharles"/>}}
					i18nKey="staticPages.about.storyPart1"
				/>
			</p>

			<p>
				<Trans
					components={{seanLink: <a href="https://github.com/Leftmostcat"/>}}
					i18nKey="staticPages.about.storyPart2"
				/>
			</p>

			<p>
				<Trans
					components={{benLink: <a href="https://github.com/LordSputnik"/>}}
					i18nKey="staticPages.about.storyPart3"
				/>
			</p>

			<p>
				<Trans
					components={{monkeyLink: <a href="https://github.com/MonkeyDo"/>}}
					i18nKey="staticPages.about.storyPart4"
				/>
			</p>

			<p>
				<Trans
					components={{nesLink: <a href={NESLink}/>}}
					i18nKey="staticPages.about.storyPart5"
				/>
			</p>
		</div>
	);
}

AboutPage.displayName = 'AboutPage';

export default AboutPage;
