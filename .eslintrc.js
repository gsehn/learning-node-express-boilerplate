module.exports = {
	"env": {
		"browser": true,
		"commonjs": true,
		"es6": true,
		"node": true,
		"mocha": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 2017,
		"sourceType": "module"
	},
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": 0,
		"quotes": 0,
		"semi": [
			"error",
			"always"
		],
		"no-console": 0,
	}
};
