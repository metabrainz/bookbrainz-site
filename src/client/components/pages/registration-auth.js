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


const {Alert, Button, PageHeader} = bootstrap;

/**
 * Renders a page allowing the user to sign in to MusicBrainz to
 * continue the BookBrainz registration process.
 * @returns {ReactElement} an element containing the rendered output.
 */
function RegistrationAuth() {
	return (
		<div>
			<PageHeader>Register</PageHeader>
			<p>
				To sign up as an editor of BookBrainz, you need to first
				have a MusicBrainz account. Please click the button below
				to sign in or register with MusicBrainz. You’ll then be
				redirected back to BookBrainz to continue registration!
			</p>
			<Alert bsStyle="warning">
				If you already registered for BookBrainz, and your account
				isn’t linked to a MusicBrainz account, please contact us using
				one of the links on our homepage instead of registering. We’ll
				update your account details to link your account so that you
				can sign in.
			</Alert>
			<div className="text-center">
				<Button
					href="/auth"
					type="submit"
				>
					<img
						className="margin-right-0-5"
						src="/images/MusicBrainz_logo_icon.svg"
					/>
					Sign In or Register with MusicBrainz
				</Button>
			</div>
		</div>
	);
}

RegistrationAuth.displayName = 'RegistrationForm';

// Export as hot module (see https://github.com/gaearon/react-hot-loader)
export default hot(module)(RegistrationAuth);
