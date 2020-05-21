const path = require("path");

exports.getIndex = (req, res, next) => {
	res.render("admin/dashboard", {
		csrfToken: req.csrfToken(),
		req: req,
	});
};

exports.getPosts = (req, res, next) => {
	res.render("admin/posts", {
		csrfToken: req.csrfToken(),
		req: req,
	});
};

exports.getUserInfo = (req, res, next) => {
	res.render("admin/userInfo", {
		csrfToken: req.csrfToken(),
		req: req,
	});
};

exports.getProducts = (req, res, next) => {
	res.render("admin/products", {
		csrfToken: req.csrfToken(),
		req: req,
	});
};

exports.getUsers = (req, res, next) => {
	res.render("admin/users", {
		csrfToken: req.csrfToken(),
		req: req,
	});
};
