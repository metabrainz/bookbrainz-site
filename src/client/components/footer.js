/*
 * Copyright (C) 2016  Daniel Hsing
 *               2016  Ben Ockmore
 *               2016  Sean Burke
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


function Footer() {
	return (
		 <section className="section-footer">
			<div className="container">
				<div className="row">
					<div className="col-sm-12 col-md-4">
						<h3>
							<img alt="BookBrainz" src="/images/BookBrainz_logo.svg" width="180"/>
						</h3>
						<br/>
						<p className="color-gray">
							BookBrainz is a project to create an online database of information about every single book, magazine, journal and other publication ever written.
						</p>
						<ul className="list-unstyled">
							<li className="color-a">
								<span className="color-gray">Development IRC: </span> <a href="https://kiwiirc.com/nextclient/irc.libera.chat/?#metabrainz" rel="noopener noreferrer" target="_blank" > #metabrainz</a>
							</li>
							<li className="color-a">
								<span className="color-gray">Discussion IRC: </span> <a href="https://kiwiirc.com/nextclient/irc.libera.chat/?#bookbrainz" rel="noopener noreferrer" target="_blank" > #bookbrainz</a>
							</li>
							<li className="color-a" >
								<span className="color-gray">Email: </span> <a href="mailto:support@metabrainz.org">support@metabrainz.org </a>
							</li>
						</ul>
					</div>
					<div className="col-sm-12 col-md-4 section-md-t3">
						<h3 className="w-title-a text-brand">Useful Links</h3>
						<ul className="list-unstyled">
							<li className="item-list-a">
								<img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <a href="https://metabrainz.org/donate" rel="noopener noreferrer" target="_blank" >Donate</a>
							</li>
							<li className="item-list-a">
								<img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <a href="https://wiki.musicbrainz.org/Main_Page" rel="noopener noreferrer" target="_blank" >Wiki</a>
							</li>
							<li className="item-list-a">
								<img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <a href="https://community.metabrainz.org/" rel="noopener noreferrer" target="_blank" >Community</a>
							</li>
							<li className="item-list-a">
								<img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <a href="https://blog.metabrainz.org/" rel="noopener noreferrer" target="_blank" >Blog</a>
							</li>
							<li className="item-list-a">
								<img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <a href="https://www.redbubble.com/people/metabrainz/shop" rel="noopener noreferrer" target="_blank" >Shop</a>
							</li>
							<li className="item-list-a">
								<img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <a href="https://metabrainz.org/" rel="noopener noreferrer" target="_blank" >MetaBrainz</a>
							</li>

						</ul>
					</div>
					<div className="col-sm-12 col-md-4 section-md-t3">
						<h3 className="w-title-a text-brand">Fellow Projects</h3>
						<ul className="list-unstyled">
							<li className="item-list-a">
								 <img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <img alt="image" height="24" src="/images/meb-icons/MusicBrainz.svg" width="24"/> <a href="https://musicbrainz.org/" rel="noopener noreferrer" target="_blank" >MusicBrainz</a>
							</li>
							<li className="item-list-a">
								 <img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <img alt="image" height="24" src="/images/meb-icons/ListenBrainz.svg" width="24"/> <a href="https://listenbrainz.org/" rel="noopener noreferrer" target="_blank" >ListenBrainz</a>
							</li>
							<li className="item-list-a">
								<img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <img alt="image" height="24" src="/images/meb-icons/CritiqueBrainz.svg" width="24"/> <a href="https://critiquebrainz.org/" rel="noopener noreferrer" target="_blank" >CritiqueBrainz</a>
							</li>
							<li className="item-list-a">
								<img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <img alt="image" height="24" src="/images/meb-icons/Picard.svg" width="24"/> <a href="https://picard.musicbrainz.org/" rel="noopener noreferrer" target="_blank" >Picard</a>
							</li>
							<li className="item-list-a">
								<img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <img alt="image" height="24" src="/images/meb-icons/AcousticBrainz.svg" width="24"/> <a href="https://acousticbrainz.org/" rel="noopener noreferrer" target="_blank" >AcousticBrainz</a>
							</li>
							<li className="item-list-a">
								<img height="18" src="/images/icons/angle_double_right_icon.svg" width="18"/> <img alt="image" height="24" src="/images/meb-icons/CoverArtArchive.svg" width="24"/> <a href="https://coverartarchive.org" rel="noopener noreferrer" target="_blank" >Cover Art Archive</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="row center-p">
					<div className="col-md-3 d-none d-md-block">
						<p className="color-gray section-line">
					OSS Geek?  <a href="https://github.com/metabrainz/bookbrainz-site" rel="noopener noreferrer" target="_blank" > <span className="color-a"> Contribute Here </span> </a>
						</p>
					</div>
					<div className="col-md-6">
						<p className="section-line">
					Brought to you by <img alt="image" height="30" src="/images/meb-icons/MetaBrainz.svg" width="30"/> <span className="color-a"> MetaBrainz Foundation </span>
						</p>
					</div>
					<div className="col-md-3 d-none d-md-block">
						<p className="color-gray section-line">
					Found an Issue?  <a href="https://tickets.metabrainz.org/" rel="noopener noreferrer" target="_blank" > <span className="color-a"> Report Here </span></a>
						</p>
					</div>
				</div>
			</div>
		 </section>
	);
}

export default Footer;
