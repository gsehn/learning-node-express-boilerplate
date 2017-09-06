const mongoose = require('mongoose');

const mongodbURL = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;

mongoose.connect(mongodbURL, { useMongoClient: true })
.then(() => {
	console.log(`Mongoose connected\n`);
})
.catch((err) => console.log(`Mongoose Error`, err));

module.exports = {
	mongoose
};
