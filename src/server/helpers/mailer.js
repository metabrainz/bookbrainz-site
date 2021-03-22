import config from '../../../config/config.json';
import nodemailer from 'nodemailer';


const {mailConfig} = config;

function sendEmail({from, html, subject, to}) {
	const transporter = nodemailer.createTransport(mailConfig);
	// returns a promise
	return transporter.sendMail({from, html, subject, to});
}


export default sendEmail;
