const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

exports.signup = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error("Validation failed; entered data is incorrect.");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const email = req.body.email;
		const password = req.body.password;
		const hashedPW = await bcrypt.hash(password, 12);
		const user = new User({
			email: email,
			password: hashedPW,
			imageUrl: "images/default-profile-pic.jpg",
		});
		const result = await user.save();
		res.status(201).json({ message: "user created!", userId: result.id });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const email = req.body.email;
		const password = req.body.password;
		let loadedUser;

		// check if the user exists
		const user = await User.findOne({ where: { email: email } });
		if (!user) {
			const error = new Error("A user with this email could not be found!");
			error.statusCode = 401;
			throw error;
		}
		loadedUser = user;
		const isEqual = await bcrypt.compare(password, user.password);

		if (!isEqual) {
			const error = new Error("Wrong Password!");
			error.statusCode = 401;
			throw error;
		}
		const token = jwt.sign({ email: loadedUser.email, userId: loadedUser.id }, "somesupersecret", {
			expiresIn: 60000,
		});
		res.status(200).json({ token: token, userId: loadedUser.id });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getStatus = async (req, res, next) => {
	try {
		const token = req.get("Authorization").split(" ")[1];
		let decodedToken = jwt.verify(token, "somesupersecret");
		// if didn't verify the token
		if (!decodedToken) {
			const error = new Error("Not Authenticated");
			error.statusCode = 401;
			throw error;
		}

		const user = await User.findByPk(decodedToken.userId);
		res.status(200).json({
			message: "fetched succesfully!",
			userId: user.id,
			imageUrl: user.imageUrl,
			name: user.name,
			isValid: Date.now() <= decodedToken.exp * 1000,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updateUserInfo = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const user = await User.findByPk(userId);
		const name = req.body.name;
		// If not user is not found with this Id ...
		if (!user) {
			const error = new Error("User Not Found!");
			error.statusCode = 404;
			throw error;
		}
		// If there's an image, it will replace.
		// Otherwise it won't change
		let imageUrl = user.imageUrl;
		if (req.file) {
			imageUrl = "images/" + req.file.filename;
		}
		// If the loggedin user is different from editable user
		if (req.userId != userId) {
			const error = new Error("You are Not Authorized!");
			error.statusCode = 404;
			throw error;
		}
		// If there's an image, it will delete old one & keep the new one
		if (imageUrl !== user.imageUrl && user.imageUrl !== "images/default-profile-pic.jpg") {
			clearImage(user.imageUrl);
		}
		user.name = name;
		user.imageUrl = imageUrl;

		const result = await user.save();
		res.status(200).json({ message: "User info Updated successfully", user: result });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getUserInfo = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const user = await User.findByPk(userId);
		if (!user) {
			const error = new Error("User Not Found!");
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json(user);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

// Deleting image when deleting editing
const clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	fs.unlink(filePath, (err) => console.log(err));
};
