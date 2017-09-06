'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bc = require('bcryptjs');

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		minlength: 3,
		unique: true,
		validate: {
			validator: value => validator.isEmail(value),
			message: '{VALUE} is not valid email'
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

UserSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
	const user = this;
	const access = 'auth';
	const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

	user.tokens.push({ access, token });
	return user.save().then(() => {
		return token;
	});
};

UserSchema.statics.findByToken = function (token) {
	const User = this;
	let decoded = undefined;

	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch (e) {
		return Promise.reject();
	}

	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
};

UserSchema.statics.findByCredentials = function (email, password) {
	const User = this;

	return User.findOne({ email }).then(user => {
		if (!user) {
			return Promise.reject();
		}

		return new Promise((resolve, reject) => {
			bc.compare(password, user.password, (err, res) => {
				if (res) {
					resolve(user);
				} else {
					reject();
				}
			});
		});
	}).catch(() => {
		return Promise.reject();
	});
};

UserSchema.methods.removeToken = function (token) {
	const user = this;

	return user.update({
		$pull: {
			tokens: { token }
		}
	});
};

UserSchema.pre('save', function (next) {
	const user = this;

	if (user.isModified('password')) {
		bc.genSalt(10, (err, salt) => {
			bc.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			});
		});
	} else {
		next();
	}
});

const User = mongoose.model('User', UserSchema);

module.exports = {
	User
};
//# sourceMappingURL=User.js.map