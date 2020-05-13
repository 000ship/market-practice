const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Order = sequelize.define("order", {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	resNumber: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	paid: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
	},
	price: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
});

module.exports = Order;
