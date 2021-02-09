/**
 * Author: Michael Weibel <michael.weibel@gmail.com>
 * License: MIT
 */


import passport from 'passport';
import util from 'util';


function StrategyMock(options, verify) {
	this.name = 'mock';
	this.passAuthentication = options.passAuthentication || true;
	this.userId = options.userId || 123456;
	this.verify = verify;
}

util.inherits(StrategyMock, passport.Strategy);

StrategyMock.prototype.authenticate = function authenticate(req) {
	if (this.passAuthentication) {
		const user = {
			id: this.userId
		};

		req.user = user;
		this.verify(user, (err, resident) => {
			if (err) {
				this.fail(err);
			}
			else {
				this.success(resident);
			}
		});
	}
	else {
		this.fail('Unauthorized');
	}
};

export default StrategyMock;
