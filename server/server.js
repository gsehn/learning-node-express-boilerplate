require('./config/config');

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const {routes} = require('./routes');
const app = express();

const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(cors({ exposedHeaders: ["Link"] }));
app.use(bodyParser.json());

app.use('/', routes);

app.listen(port, () => {
	console.log(`Started server on port ${port}`);
});

module.exports = {
	app
};
