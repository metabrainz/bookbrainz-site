/*
 * Copyright (C) 2016  Ben Ockmore
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
import {Row, Col}from 'react-bootstrap';
import {genEntityIconHTMLElement, getEntityLabel} from '../helpers/entity';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {kebabCase as _kebabCase} from 'lodash';


function EntityLink({entity, inline}) {
	let sort_name = "Unnamed";
	let type = "Unnamed";
	let languages = ['Not defined'];
	if(entity.defaultAlias && entity.defaultAlias.sortName){
		sort_name = entity.defaultAlias.sortName;
	}
	if(entity.workType && entity.workType.label){
		type = entity.workType.label;
	}
	if(entity.languageSet && entity.languageSet.languages){
		languages = entity.languageSet.languages;
	}
	const [open, setOpen] = useState(false);
	let bbidElement = <div className="small">({entity.bbid})</div>;
	if (inline) {
		bbidElement = <span className="small">({entity.bbid})</span>;
	}
	return (

		<>
			<span>
				<a href={`/${_kebabCase(entity.type)}/${entity.bbid}`}>
					{genEntityIconHTMLElement(entity.type)}
					{getEntityLabel(entity)}
				</a>
				{bbidElement}

				<bootstrap.Button
				className='mx-1'
				variant="light"
				size="sm"
				onClick={() => setOpen(!open)}
				aria-controls="example-collapse-text"
				aria-expanded={open}>
					more...
				</bootstrap.Button>
				<bootstrap.Collapse in={open}>
					<div id="example-collapse-text">
						<div className='d-flex'>
							<span className='mx-4'>
								<div><b>Sort Name</b></div>
								<div>{sort_name}</div>
							</span>
							<span className='mx-4'>
								<div><b>Type</b></div>
								<div>{type}</div>
							</span>
							<span className='mx-4'>
								<div><b>Language</b></div>
								<div className='d-flex'>
									{languages.map(
										(lang)=>(<div className='mr-2'>{lang.name}</div>)
									)}		
								</div>					
							</span>
						</div>
					</div>
				</bootstrap.Collapse>
			</span>

		</>

	);
}

EntityLink.displayName = 'EntityLink';
EntityLink.propTypes = {
	entity: PropTypes.object.isRequired,
	inline: PropTypes.bool
};
EntityLink.defaultProps = {
	inline: false
};

export default EntityLink;
