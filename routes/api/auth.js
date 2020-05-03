const express = require("express");
const { body } = require("express-validator");

const User = require("../../models/user");

const apiAuthController = require("../../api/auth");

const router = express.Router();

router.put(
	"/signup",
	[
		body("email")
			.isEmail()
			.withMessage("Please enter a valid email number.")
			.custom((value, { req }) => {
				return User.findOne({
					where: { email: value },
				}).then((userDoc) => {
					if (userDoc) {
						return Promise.reject("E-mail already exists; please pick another one.");
					}
				});
			}),
		body("password", "password length should be at least, 6 characters.")
			.isLength({ min: 6 })
			.trim()
			.not()
			.isEmpty(),
	],
	apiAuthController.signup
);

router.post("/login", apiAuthController.login);

module.exports = router;
