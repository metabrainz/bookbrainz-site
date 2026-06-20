/* eslint-disable node/no-process-env */

import express from 'express';

const router = express.Router();

router.get('/set-beta-preference', (req, res) => {
	const isBeta = process.env.DEPLOY_ENV === 'beta';
	const BETA_HOST = process.env.BETA_REDIRECT_HOSTNAME || 'beta.bookbrainz.org';
	const PROD_HOST = 'bookbrainz.org';

	if (!isBeta) {
		res.cookie('beta', 'on', {
			maxAge: 31536000000,
			path: '/',
			...req.secure && {sameSite: 'None', secure: true}
		});
	}

	let returnTo = req.query.returnto || '/';

	if (typeof returnTo !== 'string' || !returnTo.startsWith('/') || returnTo.includes('//') || returnTo.includes(':')) {
		returnTo = '/';
	}

	const targetHost = isBeta ? PROD_HOST : BETA_HOST;
	let newUrl = `${req.protocol}://${targetHost}${returnTo}`;

	if (isBeta) {
		const urlObj = new URL(newUrl);
		urlObj.searchParams.set('unset_beta', '1');
		newUrl = urlObj.toString();
	}

	res.redirect(307, newUrl);
});

export default router;

