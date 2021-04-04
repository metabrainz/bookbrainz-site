/*
 * Copyright (C) 2021  Divyanshu Raj
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
import config from '../../common/helpers/config.js';
import nodemailer from 'nodemailer';

const {mailConfig} = config;

/**
 * This is a dedicated mailing interface for bookbrainz mailing services
 *
 * @param {string} from - Email address of sender
 * @param {string[]} to - Email address of receiver 
 * @param {string} subject- Subject of the E-mail
 * @param {string[]} html - Body of E-mail in form of HTML 
 * @returns {object} an object containing the error message if any error will occur.
 * If entity is found successfully in the database this function set the entity data
 * at res.locals.entity and return to next function.
 * @example
 * Promise way :
 * 
 * sendEmail("abc@gmail.com", "def@gmail.com", "Revision added to Entity", "some html string")
 * .then(()=>{
* 	  console.log("Email has been sent successfully")
 * 	 })
 * .catch((error)=>{
 * 	  //handle error
 * 	})
 * 
 * Async/Await way :
 * 
 *  try{
 * 		await sendEmail("abc@gmail.com", "def@gmail.com", "Revision added to Entity", "some html string")
 * 		console.log("Email has been sent successfully")
 *   }
 * 	catch (error) {
 * 		//handle the error
 * 	}
 * @description
 * This helper function  sends E-mail with attributes collected from argument in given order. 
 * It is basically using nodemailer's transporter to send the E-mail under the hood.
 * It returns a promise that should be handled using .then()/.catch() or async/await syntax.
 */

function sendEmail(from:string, to:string, subject:string, html:string|JSX.Element) {
	const transporter = nodemailer.createTransport(mailConfig);
	// returns a promise
	return transporter.sendMail({from, html, subject, to});
}


export default sendEmail;
