const { validationResult } = require("express-validator");
const User = require("../../models/user");
const Post = require("../../models/post");
const Product = require("../../models/product");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const config = require("../../config");
const AccessControll = require("accesscontrol");

// Initializing AccessControll
const ac = new AccessControll(config.grantsObject);

const transport = nodemailer.createTransport({
	service: config.email.service,
	auth: {
		user: config.email.username,
		pass: config.email.password,
	},
});

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
		const token = crypto.randomBytes(32).toString("hex");
		const user = new User({
			email: email,
			password: hashedPW,
			imageUrl: "images/default-profile-pic.jpg",
			emailToken: token,
			emailTokenExpiration: Date.now() + 3600000,
		});
		const result = await user.save();
		const createdUser = await User.findOne({ where: { id: result.id } });
		createdUser.createCart();
		// Sending account Confirmation E-mail
		sendEmail(email, token, "activate");
		res.status(201).json({
			message: "You signed up Successfully. Please confirm your E-mail address.",
			userId: result.id,
		});
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
		if (user.status === false) {
			const error = new Error("Your account is not activated yet. Please confirm your E-mail.");
			error.statusCode = 401;
			throw error;
		}
		const token = jwt.sign({ email: loadedUser.email, userId: loadedUser.id }, config.jwt.secret, {
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
		let decodedToken = jwt.verify(token, config.jwt.secret);
		// if didn't verify the token
		if (!decodedToken) {
			const error = new Error("Not Authenticated");
			error.statusCode = 401;
			throw error;
		}

		const user = await User.findByPk(decodedToken.userId);
		let totalPosts = await Post.count();
		let totalProducts = await Product.count();
		let totalMembers = await User.count();

		res.status(200).json({
			message: "fetched succesfully!",
			userId: user.id,
			imageUrl: user.imageUrl,
			name: user.name,
			totalPosts: totalPosts,
			totalProducts: totalProducts,
			totalViews: 1000,
			totalMembers: totalMembers,
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
		const permission = ac.can(user.role).updateOwn("profile");
		// If you have permission, continue ..
		if (permission.granted) {
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
		} else {
			// If permission is not granted
			const error = new Error("You are not allowed to update the profile.");
			error.statusCode = 405;
			throw error;
		}
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
		const permission = ac.can(user.role).readOwn("profile");
		// If you have permission, continue ..
		if (permission.granted) {
			res.status(200).json(user);
		} else {
			// If permission is not granted
			const error = new Error("You are not allowed to get the profile info.");
			error.statusCode = 405;
			throw error;
		}
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.sendConfirmEmail = async (req, res, next) => {
	try {
		const email = req.body.email;
		if (!email) {
			const error = new Error("Please enter your E-mail Address");
			error.statusCode = 401;
			throw error;
		}
		let user = await User.findOne({
			where: {
				email: email,
			},
		});
		if (!user) {
			const error = new Error("A user with this email could not be found!");
			error.statusCode = 401;
			throw error;
		}
		// If Everything was fine, continue ...
		const token = crypto.randomBytes(32).toString("hex");
		user.emailToken = token;
		user.emailTokenExpiration = Date.now() + 3600000;
		const result = await user.save();
		sendEmail(email, token, "activate");
		res.status(200).json({ message: "Confirmation E-mail Sent! Please check your Inbox." });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.sendPasswordEmail = async (req, res, next) => {
	try {
		const email = req.body.email;
		if (!email) {
			const error = new Error("Please enter your E-mail Address");
			error.statusCode = 401;
			throw error;
		}
		let user = await User.findOne({
			where: {
				email: email,
			},
		});
		if (!user) {
			const error = new Error("A user with this email could not be found!");
			error.statusCode = 401;
			throw error;
		}
		// If Everything was fine, continue ...
		const token = crypto.randomBytes(32).toString("hex");
		user.passwordToken = token;
		user.passwordTokenExpiration = Date.now() + 3600000;
		const result = await user.save();
		sendEmail(email, token, "recover");
		res.status(200).json({ message: "Password Recovery E-mail Sent!" });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.recoverPassword = async (req, res, next) => {
	try {
		const userId = await req.body.id;

		let user = await User.findByPk(userId);
		if (!user) {
			const error = new Error("No User Found!");
			error.statusCode = 401;
			throw error;
		}
		const newPassword = req.body.password;
		const hashedPW = await bcrypt.hash(newPassword, 12);

		user.password = hashedPW;
		const result = await user.save();

		res.status(200).json({ message: "Password Updated Successfully", userId: result.id });
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};
// Deleting image when deleting editing
const clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	fs.unlink(filePath, (err) => console.log(err));
};

// Sending Email
const sendEmail = (to, token, method) => {
	let subject, html;

	if (method === "activate") {
		subject = "Account Confirmation";
		html = `
		<h1>Congradulations ...</h1>
		<p>Click this <a href="http://localhost:3000/confirmEmail/${token}">Link</a> to confirm your email address.</p>
		`;
	} else if (method === "recover") {
		subject = "Password Recovery";
		html = `
		<h1>Forgot your password!? No Problem .....</h1>
		<p>Just click this <a href="http://localhost:3000/recoverPassword/${token}">Link</a> to get a new one.</p>
		`;
	}

	transport.sendMail({
		to: to,
		from: config.email.username,
		subject: subject,
		html: html,
	});
};
