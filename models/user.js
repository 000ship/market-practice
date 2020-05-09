const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const User = sequelize.define("user", {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	name: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	email: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	emailToken: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	emailTokenExpiration: {
		type: Sequelize.DATE,
		allowNull: false,
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	passwordToken: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	passwordTokenExpiration: {
		type: Sequelize.DATE,
		allowNull: true,
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
