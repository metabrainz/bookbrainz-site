import nodemailer from 'nodemailer';
import config from '../../../config/config.json';

const {mailConfig} = config;

async function sendEmail({from, to, subject, html}) {
	const transporter = nodemailer.createTransport(mailConfig);
	// returns a promise
	return transporter.sendMail({from, to, subject, html});
}


export default sendEmail;
