const fs = require("fs");
const path = require("path");
const Post = require("../../models/post");
const User = require("../../models/user");
const config = require("../../config");

exports.getUsers = async (req, res, next) => {
	try {
		const users = await User.findAll();
		res.status(200).json(users);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deleteUser = async (req, res, next) => {
	try {
		const user = User.findByPk("req.params.userId");
		if (!user) {
			const error = new Error("Could not find user.");
			error.statusCode = 404;
			throw error;
		}
		await user.destroy();
		res.status(200).json({ message: "Success!" });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updateUserRole = async (req, res, next) => {
	try {
		const role = req.body.role;
		const user = await User.findByPk(req.params.userId);
		if (!user) {
			const error = new Error("Could not find user.");
			error.statusCode = 404;
			throw error;
		}
		user.role = role;
		await user.save();
		res.status(200).json({ message: "User Role Updated successfully" });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updateUserStatus = async (req, res, next) => {
	try {
		const status = req.body.status;
		const user = await User.findByPk(req.params.userId);
		if (!user) {
			const error = new Error("Could not find user.");
			error.statusCode = 404;
			throw error;
		}
		user.status = status;
		await user.save();
		res.status(200).json({ message: "User Status Updated successfully" });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
	}
};
