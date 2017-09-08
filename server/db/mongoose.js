const mongoose = require('mongoose');

const mongodbURL = process.env.MONGODB_URI;
mongoose.Promise = global.Promise;

(async () => {
	try {
		await mongoose.connect(mongodbURL, { useMongoClient: true });
		console.log(`Mongoose connected\n`);
	} catch (err) {
		console.log(`Mongoose Error`, err);
	}
})();

module.exports = {
	mongoose
};
