const path = require("path");

exports.getIndex = (req, res, next) => {
	res.render("admin/dashboard");
};

exports.getPosts = (req, res, next) => {
	res.render("admin/posts");
};
