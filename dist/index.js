'use strict';

require('./config/config');

const { version } = require('./../package.json');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose'); // eslint-disable-line
const { Todo } = require('./models/Todo');
const { User } = require('./models/User');
const { authenticate } = require('./middleware/authenticate');

const app = express();

const port = process.env.PORT || 3000;

app.use(morgan('dev'));

app.use(cors({ exposedHeaders: ["Link"] }));

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.json({ version });
});

app.post('/todos', authenticate, (req, res) => {
	const todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	todo.save().then(todo => {
		res.send({ todo });
	}).catch(err => {
		res.status(400).send(err);
	});
});

app.get('/todos', authenticate, (req, res) => {
	Todo.find({
		_creator: req.user._id
	}).then(todos => {
		res.send({ todos });
	}).catch(err => {
		res.status(400).send(err);
	});
});

app.get('/todos/:id', authenticate, (req, res) => {
	const { id } = req.params;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	Todo.findOne({
		_id: id,
		_creator: req.user._id
	}).then(todo => {
		if (todo) {
			res.send({ todo });
		} else {
			res.status(404).send();
		}
	}).catch(err => {
		console.log(err);
		res.status(400).send();
	});
});

app.delete('/todos/:id', authenticate, (req, res) => {
	const { id } = req.params;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	Todo.findOneAndRemove({
		_id: id,
		_creator: req.user._id
	}).then(todo => {
		if (todo) {
			res.send({ todo });
		} else {
			res.status(404).send();
		}
	}).catch(err => {
		res.status(400).send();
		console.log(err);
	});
});

app.patch('/todos/:id', authenticate, (req, res) => {
	const id = req.params.id;
	const body = _.pick(req.body, ['text', 'completed']);

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOneAndUpdate({
		_id: id,
		_creator: req.user._id
	}, { $set: body }, { new: true }).then(todo => !todo ? res.status(404).send() : res.send({ todo })).catch(err => {
		res.status(400).send();
		console.log(err);
	});
});

app.post('/users', (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);
	const user = new User(body);

	user.save().then(user => {
		return user.generateAuthToken();
	}).then(token => {
		res.header('x-auth', token).send({ user });
	}).catch(err => {
		res.status(400).send(err);
	});
});

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

app.post('/users/login', (req, res) => {
	const { email, password } = req.body;

	User.findByCredentials(email, password).then(user => {
		if (!user) {
			return res.status(400).send();
		}

		return user.generateAuthToken().then(token => {
			res.header('x-auth', token).send({ user });
		});
	}).catch(() => {
		return res.status(400).send();
	});
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}).catch(() => {
		res.status(400).send();
	});
});

app.listen(port, () => {
	console.log(`Started server on port ${port}`);
});

module.exports = {
	app
};
//# sourceMappingURL=index.js.map