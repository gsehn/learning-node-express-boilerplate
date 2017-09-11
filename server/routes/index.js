const express = require('express');
const routes = express.Router({mergeParams: true});
const {version} = require('./../../package.json');

const {todosRouter} = require('./todosRouter');
const {usersRouter} = require('./usersRouter');

routes.get('/', (req, res) => {
	res.json({ version });
});

routes.use('/users', usersRouter);
routes.use('/todos', todosRouter);

module.exports = {
	routes
};
