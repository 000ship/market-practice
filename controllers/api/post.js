const fs = require("fs");
const path = require("path");
const Post = require("../../models/post");
const User = require("../../models/user");
const { validationResult } = require("express-validator");
const config = require("../../config");
const AccessControll = require("accesscontrol");

// Initializing AccessControll
const ac = new AccessControll(config.grantsObject);

exports.getPosts = async (req, res, next) => {
	try {
		const posts = await Post.findAll();
		res.status(200).json(posts);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getPost = async (req, res, next) => {
	try {
		const postId = req.params.postId;
		const post = await Post.findByPk(postId);
		if (!post) {
			const error = new Error("Could not find post.");
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json(post);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.createPost = async (req, res, next) => {
	try {
		const user = await User.findByPk(req.userId);
		const permission = ac.can(user.role).createOwn("post");
		if (permission.granted) {
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

			if (!user) {
				const error = new Error("Could not find user.");
				error.statusCode = 404;
				throw error;
			}
			const result = await user.createPost({
				title: req.body.title,
				imageUrl: "images/" + req.file.filename,
				content: req.body.content,
			});
			res.status(201).json({ message: "post created successfully", post: result });
		} else {
			const error = new Error("You are not allowed to create post.");
			error.statusCode = 405;
			throw error;
		}
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deletePost = async (req, res, next) => {
	try {
		const postId = req.params.postId;
		const post = await Post.findByPk(postId);
		const user = await User.findByPk(req.userId);

		const permission = ac.can(user.role).deleteOwn("post");
		// If you have permission, continue ..
		console.log("ASK FOR PERMISSON");
		if (permission.granted) {
			console.log("Permission GRANTED");
			if (!post) {
				const error = new Error("Could not find post.");
				error.statusCode = 404;
				throw error;
			}
			// Check if the post is created by the logged in user or not
			if (post.userId !== req.userId) {
				const error = new Error("Not Authorized");
				error.statusCode = 404;
				throw error;
			}
			clearImage(post.imageUrl);
			await post.destroy();
			res.status(200).json({ message: "Success!" });
		} else {
			// If permission is not granted
			console.log("Permission DENIED");
			const error = new Error("You are not allowed to delete this post.");
			error.statusCode = 405;
			throw error;
		}
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updatePost = async (req, res, next) => {
	try {
		const user = await User.findByPk(req.userId);
		const permission = ac.can(user.role).updateOwn("post");
		// If you have permission, continue ..
		if (permission.granted) {
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

			const post = await Post.findByPk(postId);
			if (!post) {
				const error = new Error("Could not find post.");
				error.statusCode = 404;
				throw error;
			}
			// Check if the post is created by the logged in user or not
			if (post.userId !== req.userId) {
				console.log("you are not authorized!");
				const error = new Error("Not Authorized");
				error.statusCode = 404;
				throw error;
			}

			if (imageUrl !== post.imageUrl) {
				clearImage(post.imageUrl);
			}
			post.title = title;
			post.imageUrl = imageUrl;
			post.content = content;

			const result = await post.save();
			res.status(200).json({ message: "post Updated successfully", post: result });
		} else {
			// If permission is not granted
			const error = new Error("You are not allowed to this post.");
			error.statusCode = 405;
			throw error;
		}
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

// Deleting image when deleting post or editing
const clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", "..", filePath);
	fs.unlink(filePath, (err) => console.log(err));
};
