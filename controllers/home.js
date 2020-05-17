const User = require("../models/user");
const Product = require("../models/product");
const Post = require("../models/post");
const config = require("../config");
const sm = require("sitemap");
const RSS = require("rss");

const ITEMS_PER_PAGE = 4;
exports.getIndex = (req, res, next) => {
	res.render("home/index");
};

exports.getProducts = async (req, res, next) => {
	res.render("home/products");
};

exports.getPosts = async (req, res, next) => {
	res.render("home/posts");
};

exports.getCart = async (req, res, next) => {
	res.render("home/cart");
};

exports.getOrders = async (req, res, next) => {
	res.render("home/orders", {
		errorMessage: "",
		type: "",
	});
};

exports.getSitemap = async (req, res, next) => {
	try {
		let sitemap = sm.createSitemap({
			hostname: config.app.website + ":" + config.app.port,
			// cacheTime: 600000
		});
		sitemap.add({ url: "/", changeFreq: "daily", priority: 1 });
		sitemap.add({ url: "/posts", priority: 1 });
		sitemap.add({ url: "/products", priority: 1 });

		res.header("Content-type", "application/xml");
		res.send(sitemap.toString());
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getRegistration = (req, res, next) => {
	res.render("home/registrationForm", {
		siteKey: config.recaptcha.siteKey,
		errorMessage: null,
	});
};

exports.confirmEmail = async (req, res, next) => {
	try {
		const token = await req.params.token;
		if (!token) {
			return res.render("home/registrationForm", {
				siteKey: config.recaptcha.siteKey,
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
				siteKey: config.recaptcha.siteKey,
				errorMessage: "No User Found",
				type: "error",
			});
		}
		if (user.status === true) {
			return res.render("home/registrationForm", {
				siteKey: config.recaptcha.siteKey,
				errorMessage: "You are already activated.",
				type: "success",
			});
		}
		if (user.emailTokenExpiration < new Date(Date.now())) {
			return res.render("home/registrationForm", {
				siteKey: config.recaptcha.siteKey,
				errorMessage: "Link is Expired. Please request for a new link.",
				type: "error",
			});
		}

		user.status = true;
		const result = await user.save();

		res.render("home/registrationForm", {
			siteKey: config.recaptcha.siteKey,
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
				siteKey: config.recaptcha.siteKey,
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
				siteKey: config.recaptcha.siteKey,
				errorMessage: "No User Found",
				type: "error",
			});
		}
		if (user.passwordTokenExpiration < new Date(Date.now())) {
			return res.render("home/registrationForm", {
				siteKey: config.recaptcha.siteKey,
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

exports.feedProducts = async (req, res, next) => {
	try {
		//
		let feed = new RSS({
			title: "Market Practice Products RSS Feed",
			description: "Beware of dicounts and special offers.",
			feed_url: `${config.app.website} + ':' + ${config.app.port}/feed/products`,
			site_url: config.app.website + ":" + config.app.port,
		});
		let products = await Product.findAll({ include: ["user"] });
		products.forEach((product) => {
			feed.item({
				title: product.title,
				description: product.content,
				author: product.user.name,
				price: product.price,
				date: product.createdAt,
			});
		});

		console.log(feed);
		res.header("Content-type", "application/xml");
		res.send(feed.xml());
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.feedPosts = async (req, res, next) => {
	try {
		//
		let feed = new RSS({
			title: "Market Practice Posts RSS Feed",
			description: "Get the best Articles.",
			feed_url: `${config.app.website} + ':' + ${config.app.port}/feed/posts`,
			site_url: config.app.website + ":" + config.app.port,
		});
		let posts = await Post.findAll({ include: ["user"] });
		posts.forEach((post) => {
			feed.item({
				title: post.title,
				author: post.user.name,
				description: post.content,
				date: post.createdAt,
			});
		});

		console.log(feed);
		res.header("Content-type", "application/xml");
		res.send(feed.xml());
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};
