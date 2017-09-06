'use strict';

const { expect } = require('chai');
const request = require('supertest');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const { app } = require('./../app');
const { Todo } = require('./../models/Todo');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');
const { User } = require('./../models/User');

describe('/todos', () => {

	beforeEach(populateUsers);
	beforeEach(populateTodos);

	describe('POST /todos', () => {
		it('should create a new Todo', done => {
			const text = 'Test Todo text';

			request(app).post('/todos').set('x-auth', users[4].tokens[0].token).send({ text }).expect(200).expect(res => {
				expect(res.body.todo.text).to.equal(text);
			}).end(err => {
				// could have err, res
				if (err) {
					return done(err);
				}

				Todo.find({ text }).then(todos => {
					expect(todos.length).to.equal(1);
					expect(todos[0].text).to.equal(text);
					done();
				}).catch(err => done(err));
			});
		});

		it('should not create Todo with invalid body data', done => {
			request(app).post('/todos').set('x-auth', users[4].tokens[0].token).send({}).expect(400).end(err => {
				if (err) {
					return done(err);
				}
				Todo.find().then(todos => {
					expect(todos.length).to.equal(2);
					done();
				}).catch(err => {
					done(err);
				});
			});
		});
	});

	describe("GET /todos", () => {
		it('should get all todos', done => {
			request(app).get('/todos').set('x-auth', users[4].tokens[0].token).expect(200).expect(res => {
				expect(res.body.todos.length).to.equal(2);
			}).end(done);
		});
	});

	describe('GET /todos/:id', () => {
		it('should return a todo', done => {
			request(app).get(`/todos/${todos[0]._id.toHexString()}`).set('x-auth', users[4].tokens[0].token).expect(200).expect(res => {
				// console.log(res.body);
				// console.log(res.body.text);
				expect(res.body.todo.text).to.equal(todos[0].text);
			}).end(done);
		});

		it('should return 404 if todo is not found', done => {
			request(app).get(`/todos/${new ObjectID().toHexString()}`).set('x-auth', users[4].tokens[0].token).expect(404).end(done);
		});

		it('should return 404 for non object ids', done => {
			request(app).get(`/todos/123`).set('x-auth', users[4].tokens[0].token).expect(404).end(done);
		});
	});

	describe('DELETE /todos/:id', () => {
		it('should remove a todo', done => {
			request(app).delete(`/todos/${todos[1]._id.toHexString()}`).set('x-auth', users[4].tokens[0].token).expect(200).expect(res => {
				expect(res.body.todo._id).to.equal(todos[1]._id.toHexString());
			}).end(err => {
				if (err) {
					return done(err);
				}

				Todo.findById(todos[1]._id.toHexString()).then(todo => {
					expect(todo).to.not.exist;
					done();
				}).catch(err => {
					done(err);
				});
			});
		});

		it('should return 404 if todo not found', done => {
			request(app).delete(`/todos/z${todos[1]._id.toHexString().substring(1)}`).set('x-auth', users[4].tokens[0].token).expect(404).end(done);
		});

		it('should return 404 if object id is invalid', done => {
			request(app).delete(`/todos/zasdasd`).set('x-auth', users[4].tokens[0].token).expect(404).end(done);
		});
	});

	describe('PATCH /todos/:id', () => {
		it('should update the todo', done => {
			const text = 'new text[0]';

			request(app).patch(`/todos/${todos[0]._id.toHexString()}`).set('x-auth', users[4].tokens[0].token).send({ text, completed: true }).expect(200).expect(res => {
				expect(res.body.todo.text).to.equal(text);
				expect(res.body.todo.completed).to.equal(true);
				expect(res.body.todo.completedAt).to.be.a('number');
			}).end(done);
		});

		it('should clear completedAt when todo is not completed', done => {
			const text = 'new text[1]';

			request(app).patch(`/todos/${todos[1]._id.toHexString()}`).send({ text, completed: false }).set('x-auth', users[4].tokens[0].token).expect(200).expect(res => {
				expect(res.body.todo.text).to.equal(text);
				expect(res.body.todo.completed).to.equal(false);
				expect(res.body.todo.completedAt).to.not.exist;
			}).end(done);
		});

		it('should return 404 for invalid id', done => {
			request(app).patch(`/todos/123123`, {}).set('x-auth', users[4].tokens[0].token).expect(404).end(done);
		});
	});
});

describe('/users', () => {

	beforeEach(populateUsers);

	describe('POST /users', () => {
		it('should create a user properly', done => {
			request(app).post('/users').send(users[1]).expect(200).expect(res => {
				expect(res.body.user.email).to.be.a('string');
				expect(res.body.user.email).to.equal(users[1].email);
				expect(res.headers['x-auth']).to.exist;
			}).end(err => {
				if (err) {
					return done(err);
				}

				const { email, password } = users[1];

				User.find({ email }).then(users => {
					expect(users.length).to.equal(1);
					expect(users[0].email).to.equal(email);
					expect(users[0].password).to.not.equal(password);
					done();
				}).catch(err => done(err));
			});
		});

		it('should reject duplicate email', done => {
			request(app).post('/users').send(users[0]).expect(400).end(done);
		});

		it('should validate and reject an invalid email', done => {
			request(app).post('/users').send(users[2]).expect(400).end(done);
		});

		it('should validate and reject an invalid password', done => {
			request(app).post('/users').send(users[3]).expect(400).end(done);
		});
	});

	describe('GET /users/me', () => {

		it('should return user if authenticated', done => {

			request(app).get('/users/me').set('x-auth', users[4].tokens[0].token).expect(200).expect(res => {
				expect(res.body._id).to.equal(users[4]._id.toHexString());
				expect(res.body.email).to.equal(users[4].email);
			}).end(done);
		});

		it('should should return 401 if user is not authenticated', done => {
			request(app).get('/users/me').expect(401).expect(res => {
				expect(res.body).to.be.empty;
			}).end(done);
		});
	});

	describe('DELETE /users/me/token', () => {
		it('should remove auth token on logout', done => {
			request(app).delete('/users/me/token').set('x-auth', users[4].tokens[0].token).expect(200).end((err, res) => {
				// eslint-disable-line
				if (err) {
					return done(err);
				}

				User.findById(users[4]._id).then(user => {
					expect(user.tokens.length).to.equal(0);
					done();
				}).catch(err => {
					done(err);
				});
			});
		});
	});

	describe('POST /users/login', () => {

		it('should login successfully', done => {
			const user = _.pick(users[5], ['email', 'password']);

			request(app).post('/users/login').send(user).expect(200).expect(res => {
				expect(res.headers['x-auth']).to.exist;
			}).end((err, res) => {
				if (err) {
					return done(err);
				}

				User.findOne({ email: user.email }).then(user => {
					expect(user.tokens[0]).to.include({
						access: 'auth',
						token: res.headers['x-auth']
					});
					done();
				}).catch(err => {
					done(err);
				});
			});
		});

		it('should reject wrong password', done => {
			const user = _.pick(users[5], ['email', 'password']);
			user.password += 'a';

			request(app).post('/users/login').send(user).expect(400).end((err, res) => {
				// eslint-disable-line
				if (err) {
					return done(err);
				}

				User.findOne({ email: user.email }).then(user => {
					expect(user.tokens.length).to.equal(0);
					done();
				}).catch(err => {
					done(err);
				});
			});
		});

		it('should reject user not found', done => {
			request(app).post('/users/login').send({
				email: 'emailDoesntExist@examplenonexistent.com',
				password: '123123123'
			}).expect(400).end(done);
		});
	});
});
//# sourceMappingURL=server.test.js.map