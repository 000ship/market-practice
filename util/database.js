const config = require("../config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
	dialect: config.db.dialect,
	host: config.db.host,
});

module.exports = sequelize;
