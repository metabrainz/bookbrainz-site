/*
 * Copyright (C) 2015  Annie Zhou
 *               2016  Sean Burke
 *               2016  Ben Ockmore
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
import {hot} from 'react-hot-loader';
import {useTranslation} from 'react-i18next';


const {Alert, Button} = bootstrap;

/**
 * Renders a page allowing the user to sign in to MusicBrainz to
 * continue the BookBrainz registration process.
 * @returns {ReactElement} an element containing the rendered output.
 */
function RegistrationAuth() {
	const {t: translate} = useTranslation();

	return (
		<div>
			<div className="page-header"><h1>{translate('pages.registration.heading')}</h1></div>
			<p>
				{translate('pages.registration.authIntroText')}
			</p>
			<Alert variant="warning">
				{translate('pages.registration.authWarningAlert')}
			</Alert>
			<div className="text-center">
				<Button
					href="/auth"
					type="submit"
				>
					<img
						alt="MusicBrainz"
						className="margin-right-0-5"
						src="/images/MusicBrainz_logo_icon.svg"
					/>
					{translate('pages.registration.authButtonText')}
				</Button>
			</div>
		</div>
	);
}

RegistrationAuth.displayName = 'RegistrationForm';

// Export as hot module (see https://github.com/gaearon/react-hot-loader)
export default hot(module)(RegistrationAuth);
