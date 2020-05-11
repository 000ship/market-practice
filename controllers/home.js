const User = require("../models/user");
const Product = require("../models/product");

const ITEMS_PER_PAGE = 4;
exports.getIndex = (req, res, next) => {
	res.render("home/index");
};

exports.getProducts = async (req, res, next) => {
	res.render("home/products");
};

exports.getRegistration = (req, res, next) => {
	res.render("home/registrationForm", {
		errorMessage: null,
	});
};

exports.confirmEmail = async (req, res, next) => {
	try {
		const token = await req.params.token;
		if (!token) {
			return res.render("home/registrationForm", {
				errorMessage: "Link is Broken. Please request for a new link.",
				type: "error",
			});
		}
		let user = await User.findOne({
			where: {
				emailToken: token,
			},
		});
		if (!user) {
			return res.render("home/registrationForm", {
				errorMessage: "No User Found",
				type: "error",
			});
		}
		if (user.status === true) {
			return res.render("home/registrationForm", {
				errorMessage: "You are already activated.",
				type: "success",
			});
		}
		if (user.emailTokenExpiration < new Date(Date.now())) {
			return res.render("home/registrationForm", {
				errorMessage: "Link is Expired. Please request for a new link.",
				type: "error",
			});
		}

		user.status = true;
		const result = await user.save();

		res.render("home/registrationForm", {
			errorMessage: "Your Account is activated successfully.",
			type: "success",
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.recoverPassword = async (req, res, next) => {
	try {
		const token = await req.params.token;
		if (!token) {
			return res.render("home/registrationForm", {
				errorMessage: "Link is Broken. Please request for a new link.",
				type: "error",
			});
		}
		let user = await User.findOne({
			where: {
				passwordToken: token,
			},
		});
		if (!user) {
			return rres.render("home/registrationForm", {
				errorMessage: "No User Found",
				type: "error",
			});
		}
		if (user.passwordTokenExpiration < new Date(Date.now())) {
			return res.render("home/registrationForm", {
				errorMessage: "Link is Expired. Please request for a new link.",
				type: "error",
			});
		}

		res.render("home/passwordRecovery", {
			errorMessage: "Enter Your New Password",
			type: "success",
			userId: user.id,
			email: user.email,
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};
