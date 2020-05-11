const path = require("path");

exports.getIndex = (req, res, next) => {
	res.render("admin/dashboard");
};

exports.getPosts = (req, res, next) => {
	res.render("admin/posts");
};

exports.getUserInfo = (req, res, next) => {
	res.render("admin/userInfo");
};

exports.getProducts = (req, res, next) => {
	res.render("admin/products");
};
