const dotenv = require('dotenv');
dotenv.config();

const config = {
	"TOKEN": process.env.TOKEN,
}

module.exports = config;