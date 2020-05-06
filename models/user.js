const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const User = sequelize.define("user", {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	email: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	imageUrl: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	status: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
});

module.exports = User;
