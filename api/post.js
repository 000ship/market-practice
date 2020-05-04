const fs = require("fs");
const path = require("path");
const Post = require("../models/post");
const User = require("../models/user");
const { validationResult } = require("express-validator");

exports.getPosts = (req, res, next) => {
	Post.findAll()
		.then((posts) => {
			res.status(200).json(posts);
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findByPk(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Could not find post.");
				error.statusCode = 404;
				throw error;
			}
			res.status(200).json(post);
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.createPost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// Delete uploaded image incase of validation error
		clearImage("images/" + req.file.filename);
		const error = new Error("Validation failed; entered data is incorrect.");
		error.statusCode = 422;
		throw error;
	}

	if (!req.file) {
		const error = new Error("No image provided!");
		error.statusCode = 422;
		throw error;
	}

	User.findByPk(req.userId)
		.then((user) => {
			if (!user) {
				const error = new Error("Could not find user.");
				error.statusCode = 404;
				throw error;
			}
			user
				.createPost({
					title: req.body.title,
					imageUrl: "images/" + req.file.filename,
					content: req.body.content,
				})
				.then((result) => {
					res.status(201).json({ message: "post created successfully", post: result });
				})
				.catch((err) => {
					if (!err.statusCode) {
						err.statusCode = 500;
					}
					next(err);
				});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.deletePost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findByPk(postId)
		.then((post) => {
			// check loged in user
			clearImage(post.imageUrl);
			post.destroy().then((result) => {});
			res.status(200).json({ message: "Success!" });
		})
		.catch((err) => {
			res.status(500).json({ message: "Deleting Post failed." });
		});
};

exports.updatePost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// Delete uploaded image incase of validation error
		clearImage("images/" + req.file.filename);
		const error = new Error("Validation failed; entered data is incorrect.");
		error.statusCode = 422;
		throw error;
	}

	const postId = req.params.postId;
	const title = req.body.title;
	const content = req.body.content;
	let imageUrl = req.body.oldImage;

	if (req.file) {
		imageUrl = "images/" + req.file.filename;
	}
	if (!imageUrl) {
		const error = new Error("No file pickd!");
		error.statusCode = 422;
		throw error;
	}

	Post.findByPk(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Could not find post.");
				error.statusCode = 404;
				throw error;
			}
			if (imageUrl !== post.imageUrl) {
				clearImage(post.imageUrl);
			}
			post.title = title;
			post.imageUrl = imageUrl;
			post.content = content;

			return post.save().then((result) => {
				res.status(200).json({ message: "post Updated successfully", post: result });
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

// Deleting image when deleting post or editing
const clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	fs.unlink(filePath, (err) => console.log(err));
};
