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
			.custom(async (value, { req }) => {
				const userDoc = await User.findOne({
					where: { email: value },
				});
				if (userDoc) {
					return Promise.reject("E-mail already exists; please pick another one.");
				}
			}),
		body("password", "password length should be at least, 6 characters.")
			.isLength({ min: 6 })
			.trim()
			.not()
			.isEmpty(),
		body("passwordRepeat")
			.trim()
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error("Passwords have to match");
				}
				return true;
			}),
	],
	apiAuthController.signup
);

router.post("/login", apiAuthController.login);

router.get("/getStatus", apiAuthController.getStatus);

module.exports = router;
