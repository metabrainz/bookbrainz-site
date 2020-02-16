/*
 * Copyright (C) 2019  SBVKrishna
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

import {config, library} from '@fortawesome/fontawesome-svg-core';
import {
	faBook, faCalendarAlt, faChartLine, faCheck, faCircle, faCircleNotch,
	faComment, faEnvelope, faExclamationTriangle, faExternalLinkAlt,
	faGlobe, faHistory, faInfo, faPenNib, faPencilAlt, faPencilRuler,
	faPlus, faQuestionCircle, faRemoveFormat, faSearch, faSignInAlt,
	faSignOutAlt, faSlash, faTimes, faTimesCircle, faTrashAlt,
	faUniversity, faUser, faUserCircle, faWindowRestore
} from '@fortawesome/free-solid-svg-icons';
import {fab} from '@fortawesome/free-brands-svg-icons';


// Disable FontAwesome's CSS (to prevent FOUC)
config.autoAddCss = false;

// Add Icons to FontAwesome library
library.add(
	fab, faBook, faCalendarAlt, faChartLine, faCheck, faCircle, faCircleNotch,
	faComment, faEnvelope, faExclamationTriangle, faExternalLinkAlt,
	faGlobe, faHistory, faInfo, faPenNib, faPencilAlt, faPencilRuler,
	faPlus, faQuestionCircle, faRemoveFormat, faSearch, faSignInAlt,
	faSignOutAlt, faSlash, faTimes, faTimesCircle, faTrashAlt,
	faUniversity, faUser, faUserCircle, faWindowRestore
);
