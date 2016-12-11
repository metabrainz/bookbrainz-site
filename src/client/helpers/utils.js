'use strict';

function injectDefaultAliasName(instance) {
	if (instance && instance.name) {
		const injectedObj = Object.assign({}, instance, {
			defaultAlias: {
				name: instance.name
			}
		});
		return injectedObj;
	}
	return instance;
}

exports.injectDefaultAliasName = injectDefaultAliasName;
