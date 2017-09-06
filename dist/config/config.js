'use strict';

const env = process.env.NODE_ENV || 'development';
console.log(`NODE_ENV=${env}`);

if (env === 'development' || env === 'test') {
	const config = require('./config.json');
	const envConfig = config[env];

	Object.keys(envConfig).forEach(key => {
		process.env[key] = envConfig[key];
		console.log(`process.env[${key}]=[${process.env[key]}]`);
	});
}
//# sourceMappingURL=config.js.map