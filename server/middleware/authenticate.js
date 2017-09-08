const {User} = require('./../models/User');

const authenticate = async (req, res, next) => {
	const token = req.header('x-auth');

	try {
		// console.log(`auth - finding by token`);
		const user = await User.findByToken(token);
		// console.log(`auth - user: {${user}}`);
		if (!user) {
			throw new Error();
		}
		req.user = user;
		req.token = token;
		next();
	} catch (err) {
		res.status(401).send();
	}
};

module.exports = {
	authenticate
};
