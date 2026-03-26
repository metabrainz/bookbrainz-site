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
 */;
import '../../i18n';
import { useTranslation, Trans} from 'react-i18next';
import {faCircle, faCommentDots, faComments, faEnvelope} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import React from 'react';
import {faXTwitter} from '@fortawesome/free-brands-svg-icons';


function resolveLng(i18nInstance: {resolvedLanguage?: string; language?: string}): 'en' | 'es' {
	const raw = (i18nInstance.resolvedLanguage || i18nInstance.language || 'en').toLowerCase();
	return raw.startsWith('es') ? 'es' : 'en';
}

/**
 * Renders the document and displays the 'About' page.
 * @returns {JSX.Element} a React JSX Element
 * page
 */
function AboutPage(): JSX.Element {
	const { t, i18n } = useTranslation();
	const [selectLng, setSelectLng] = React.useState<'en' | 'es'>('en');

	React.useEffect(() => {
		setSelectLng(resolveLng(i18n));
	}, [i18n, i18n.language, i18n.resolvedLanguage]);

	const NESLink =
		'https://ocharles.org.uk/blog/posts/' +
			'2012-07-10-nes-does-it-better-1.html';

	return (
		<div>

			<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
				<button
					onClick={() => {
					const newLang = i18n.language.startsWith('es') ? 'en' : 'es';
					i18n.changeLanguage(newLang);
					}}
					className="btn btn-sm btn-outline-secondary"
				>
					{i18n.language.startsWith('es') ? 'EN' : 'ES'}
				</button>
			</div>
			


			<div className="page-header"><h1>{t("about.title")}</h1></div>
			<p className="lead">{t("about.intro")}</p>

			<p>
				<Trans i18nKey="about.commitment" />{' '}
				<a href="/register">{t("about.becomeEditor")}</a>
			</p>

			<p>{t("about.contributors")}</p>

			<h2>{t("about.accessingData.title")}</h2>

			<p>
				<Trans
					i18nKey="about.accessingData.description"
					components={[<a href="/licensing" />]}
				/>
			</p>

			<p>
				<Trans
					i18nKey="about.accessingData.dumps"
					components={[<a href="http://ftp.musicbrainz.org/pub/musicbrainz/bookbrainz/latest.sql.bz2" ></a>]}
				/>
			</p>

			<p>
				<Trans
					i18nKey="about.accessingData.api"
					components={[<a href="https://api.bookbrainz.org/1/docs/" ></a>]}
				/>
			</p>

			<h2>{t("about.contact.title")}</h2>
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
					{t("about.contact.chat")}<br/>
					<small>{t("about.contact.platforms")}</small>
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
					{t("about.contact.forum")}
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
					{t("about.contact.X")}
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
					{t("about.contact.email")}
				</a>
				<FontAwesomeIcon
					className="margin-sides-1 contact-text"
					icon={faCircle}
				/>
			</div>

			<h2>{t("about.story.title")}</h2>

			<p>
			<Trans
				i18nKey="about.story.p1"
				values={{ name: "Oliver Charles" }}
				components={[<a href="https://github.com/ocharles"></a>]}
			/>
			</p>

			<p>
			<Trans
				i18nKey="about.story.p2"
				values={{ name: "Sean Burke" }}
				components={[<a href="https://github.com/Leftmostcat"></a>]}
			/>
			</p>

			<p>
			<Trans
				i18nKey="about.story.p3"
				values={{ name: "Ben Ockmore" }}
				components={[<a href="https://github.com/LordSputnik"></a>]}
			/>
			</p>

			<p>
			<Trans
				i18nKey="about.story.p4"
				values={{ name: "Nicolas Pelletier (AKA Monkey)" }}
				components={[<a href="https://github.com/MonkeyDo"></a>]}
			/>
			</p>

			<p>
			<Trans
				i18nKey="about.story.p5"
				components={[<a href={NESLink}></a>]}
			/>
			</p>
		</div>
	);
}

AboutPage.displayName = 'AboutPage';

export default AboutPage;
