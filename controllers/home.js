const User = require("../models/user");
const Product = require("../models/product");
const Post = require("../models/post");
const config = require("../config");
const sm = require("sitemap");
const RSS = require("rss");
const i18n = require("i18n");

const ITEMS_PER_PAGE = 4;
exports.getIndex = (req, res, next) => {
	res.render("home/index", {
		req: req,
	});
};

exports.getProducts = async (req, res, next) => {
	res.render("home/products", {
		csrfToken: req.csrfToken(),
		req: req,
	});
};

exports.getPosts = async (req, res, next) => {
	res.render("home/posts", {
		req: req,
	});
};

exports.getCart = async (req, res, next) => {
	res.render("home/cart", {
		req: req,
	});
};

exports.getOrders = async (req, res, next) => {
	res.render("home/orders", {
		errorMessage: "",
		type: "",
		req: req,
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
		csrfToken: req.csrfToken(),
		req: req,
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
				req: req,
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
				req: req,
			});
		}
		if (user.status === true) {
			return res.render("home/registrationForm", {
				siteKey: config.recaptcha.siteKey,
				errorMessage: "You are already activated.",
				type: "success",
				req: req,
			});
		}
		if (user.emailTokenExpiration < new Date(Date.now())) {
			return res.render("home/registrationForm", {
				siteKey: config.recaptcha.siteKey,
				errorMessage: "Link is Expired. Please request for a new link.",
				type: "error",
				req: req,
			});
		}

		user.status = true;
		const result = await user.save();

		res.render("home/registrationForm", {
			siteKey: config.recaptcha.siteKey,
			errorMessage: "Your Account is activated successfully.",
			type: "success",
			req: req,
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
				req: req,
			});
		}
		let user = await User.findOne({
			where: {
				passwordToken: token,
			},
		});
		if (!user) {
			return res.render("home/registrationForm", {
				siteKey: config.recaptcha.siteKey,
				errorMessage: "No User Found",
				type: "error",
				req: req,
			});
		}
		if (user.passwordTokenExpiration < new Date(Date.now())) {
			return res.render("home/registrationForm", {
				siteKey: config.recaptcha.siteKey,
				errorMessage: "Link is Expired. Please request for a new link.",
				type: "error",
				req: req,
			});
		}

		res.render("home/passwordRecovery", {
			errorMessage: "Enter Your New Password",
			type: "success",
			userId: user.id,
			email: user.email,
			csrfToken: req.csrfToken(),
			req: req,
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

exports.setLanguage = async (req, res, next) => {
	let lang = req.params.lang;
	console.log(lang);
	if (i18n.getLocales().includes(lang)) {
		res.cookie("lang", lang, { maxAge: 1000 * 60 * 60 * 24 * 90, signed: true }); // 90 days
	}
	// Return to the page that is coming from
	res.redirect(req.header("Referer") || "/");
};
