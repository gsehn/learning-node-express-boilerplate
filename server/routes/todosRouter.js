const todosRouter = require('express').Router({mergeParams: true});
const router = todosRouter;
const {authenticate} = require('./../middleware/authenticate');
const {mongoose} = require('./../db/mongoose'); // eslint-disable-line

const {Todo} = require('./../models/Todo');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

// routes.get('/', (req, res) => {
// 	res.json({ version });
// });

router.post('/todos', authenticate, async (req, res) => {
	const todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	try {
		const savedTodo = await todo.save();
		res.send(savedTodo);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.get('/todos', authenticate, async (req, res) => {
	try {
		const todos = await Todo.find({
			_creator: req.user._id
		});
		res.send({todos});
	} catch (err) {
		res.status(400).send(err);
	}
});

router.get('/todos/:id', authenticate, async (req, res) => {
	const {id} = req.params;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	try {
		const todo = await Todo.findOne({
			_id: id,
			_creator: req.user._id
		});

		if (todo) {
			res.send({todo});
		} else {
			res.status(404).send();
		}
	} catch (err) {
		console.log(err);
		res.status(400).send();
	}

});

router.delete('/todos/:id', authenticate, async (req, res) => {
	const {id} = req.params;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	try {
		const todo = await Todo.findOneAndRemove({
			_id: id,
			_creator: req.user._id
		});

		if (todo) {
			res.send({todo});
		} else {
			res.status(404).send();
		}
	} catch (err) {
		res.status(400).send();
		console.log(err);
	}

});

router.patch('/todos/:id', authenticate, async (req, res) => {
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

	try {
		const todo = await Todo.findOneAndUpdate({
			_id: id,
			_creator: req.user._id
		}, { $set: body	}, {new: true});

		if (todo) {
			res.send(todo);
		} else {
			res.status(404).send();
		}
	} catch (err) {
		res.status(400).send();
		console.log(err);
	}

});


module.exports = {
	todosRouter
};
