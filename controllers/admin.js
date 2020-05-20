const path = require("path");

exports.getIndex = (req, res, next) => {
	res.render("admin/dashboard", {
		csrfToken: req.csrfToken(),
	});
};

exports.getPosts = (req, res, next) => {
	res.render("admin/posts", {
		csrfToken: req.csrfToken(),
	});
};

exports.getUserInfo = (req, res, next) => {
	res.render("admin/userInfo", {
		csrfToken: req.csrfToken(),
	});
};

exports.getProducts = (req, res, next) => {
	res.render("admin/products", {
		csrfToken: req.csrfToken(),
	});
};
