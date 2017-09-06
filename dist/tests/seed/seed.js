'use strict';

const { ObjectID } = require('mongodb');
const { Todo } = require('./../../models/Todo');
const { User } = require('./../../models/User');
const jwt = require('jsonwebtoken');

const userIds = [new ObjectID(), new ObjectID(), new ObjectID(), new ObjectID(), new ObjectID(), new ObjectID()];

const users = [{ _id: userIds[0], email: 'gtsehn0@gmail.com', password: '123456' }, { _id: userIds[1], email: 'gtsehn1@gmail.com', password: '123456' }, { _id: userIds[2], email: 'a@a.c', password: '123456' }, { _id: userIds[3], email: 'gtsehn2@gmail.com', password: '12345' }, {
	_id: userIds[4],
	email: 'auth1@aaa.com',
	password: '123456',
	tokens: [{
		access: 'auth',
		token: jwt.sign({ _id: userIds[4], access: 'auth' }, process.env.JWT_SECRET).toString()
	}]
}, { _id: userIds[5], email: 'jen@example.com', password: 'userPassowrd' }];

const populateUsers = done => {
	User.remove({}).then(() => {
		const user0 = new User(users[0]).save();
		const user4 = new User(users[4]).save();
		const user5 = new User(users[5]).save();

		return Promise.all([user0, user4, user5]);
	}).then(() => done()).catch(err => console.log(err));
};

const todos = [{ _id: new ObjectID(), text: 'First test todo', _creator: userIds[4] }, { _id: new ObjectID(), text: 'Second test todo', completed: true, completedAt: 123123123, _creator: userIds[4] }];

const populateTodos = done => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then(() => done()).catch(err => console.log(err));
};

module.exports = {
	todos,
	populateTodos,
	users,
	populateUsers
};
//# sourceMappingURL=seed.js.map