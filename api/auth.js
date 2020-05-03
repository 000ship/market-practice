const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation failed; entered data is incorrect.");
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	const email = req.body.email;
	const password = req.body.password;
	bcrypt
		.hash(password, 12)
		.then((hashedPW) => {
			const user = new User({
				email: email,
				password: hashedPW,
			});
			return user.save();
		})
		.then((result) => {
			res.status(201).json({ message: "user created!", userId: result.id });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.login = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	let loadedUser;

	// check if the user exists
	User.findOne({ where: { email: email } })
		.then((user) => {
			if (!user) {
				const error = new Error("A user with this email could not be found!");
				error.statusCode = 401;
				throw error;
			}
			loadedUser = user;
			return bcrypt.compare(password, user.password);
		})
		.then((isEqual) => {
			if (!isEqual) {
				const error = new Error("Wrong Password!");
				error.statusCode = 401;
				throw error;
			}
			const token = jwt.sign(
				{ email: loadedUser.email, userId: loadedUser.id },
				"somesupersecret",
				{ expiresIn: "1h" }
			);
			res.status(200).json({ token: token, userId: loadedUser.id });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
