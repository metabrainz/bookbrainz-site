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
	faAngleDoubleLeft, faAngleDoubleUp, faBook, faCalendarAlt, faChartLine, faCheck, faCircle,
	faCircleNotch, faClone, faCodeBranch, faComment, faCommentDots, faComments, faEnvelope, faExclamationTriangle,
	faExternalLinkAlt, faGlobe, faGripVertical, faHistory, faInfo, faListUl, faPenNib, faPencilAlt, faPencilRuler,
	faPlus, faQuestionCircle, faRemoveFormat, faSave, faSearch, faSignInAlt,
	faSignOutAlt, faSlash, faTasks, faTimes, faTimesCircle, faTrashAlt, faUndo,
	faUniversity, faUser, faUserCircle, faWindowRestore
} from '@fortawesome/free-solid-svg-icons';
import {fab} from '@fortawesome/free-brands-svg-icons';


// Disable FontAwesome's CSS (to prevent FOUC)
// For this, th build system needs to be able to import the css file below. Currently the build errors.
// import '@fortawesome/fontawesome-svg-core/styles.css';
// config.autoAddCss = false;

config.autoAddCss = true;

// Add Icons to FontAwesome library
library.add(
	fab, faAngleDoubleLeft, faAngleDoubleUp, faBook, faCalendarAlt, faChartLine, faCheck, faCircle,
	faCircleNotch, faClone, faCodeBranch, faComment, faCommentDots, faComments, faEnvelope, faExclamationTriangle,
	faExternalLinkAlt, faGlobe, faGripVertical, faHistory, faInfo, faListUl, faPenNib, faPencilAlt, faPencilRuler,
	faPlus, faQuestionCircle, faRemoveFormat, faSave, faSearch, faSignInAlt,
	faSignOutAlt, faSlash, faTasks, faTimes, faTimesCircle, faTrashAlt, faUndo,
	faUniversity, faUser, faUserCircle, faWindowRestore
);
