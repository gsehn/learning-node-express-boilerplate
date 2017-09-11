const usersRouter = require('express').Router({mergeParams: true});
const router = usersRouter;
const {authenticate} = require('./../middleware/authenticate');
const {mongoose} = require('./../db/mongoose'); // eslint-disable-line

const {User} = require('./../models/User');
const _ = require('lodash');


router.post('/users', async (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);
	const user = new User(body);

	try {
		const savedUser = await user.save();
		const token = await savedUser.generateAuthToken();
		res.header('x-auth', token).send({user});
	} catch (err) {
		res.status(400).send(err);
	}
});

router.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

router.post('/users/login', async (req, res) => {
	const {email, password} = req.body;

	try {
		const user = await User.findByCredentials(email, password);

		if (!user) {
			return res.status(400).send();
		}

		const token =	await user.generateAuthToken();
		res.header('x-auth', token).send({user});
	} catch (err) {
		return res.status(400).send();
	}

});

router.delete('/users/me/token', authenticate, async (req, res) => {
	try {
		await req.user.removeToken(req.token);
		res.status(200).send();
	} catch (err) {
		res.status(400).send();
	}
});
