const fs = require("fs");
const path = require("path");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
	Post.findAll()
		.then((posts) => {
			res.status(200).json(posts);
		})
		.catch((err) => console.log(err));
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findByPk(postId)
		.then((post) => {
			res.status(200).json(post);
		})
		.catch((err) => console.log(err));
};

exports.createPost = (req, res, next) => {
	const post = new Post({
		title: req.body.title,
		imageUrl: "images/" + req.file.filename,
		content: req.body.content,
	});

	return post
		.save()
		.then((result) => {
			res.status(201).json({ message: "post created successfully", post: result });
		})
		.catch((err) => console.log(err));
};

exports.deletePost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findByPk(postId)
		.then((post) => {
			// check loged in user
			post.destroy().then((result) => {});
			res.status(200).json({ message: "Success!" });
		})
		.catch((err) => {
			res.status(500).json({ message: "Deleting Post failed." });
		});
};

exports.updatePost = (req, res, next) => {
	const postId = req.params.postId;
	const title = req.body.title;
	const content = req.body.content;
	let imageUrl = req.body.oldImage;

	if (req.file) {
		imageUrl = "images/" + req.file.filename;
	}
	if (!imageUrl) {
		console.log("422-no file picked");
	}

	Post.findByPk(postId)
		.then((post) => {
			if (!post) {
				console.log("no post found");
			}
			if (imageUrl !== post.imageUrl) {
				clearImage(post.imageUrl);
			}
			post.title = title;
			post.imageUrl = imageUrl;
			post.content = content;

			return post
				.save()
				.then((result) => {
					res.status(200).json({ message: "post updated successfully", post: result });
				})
				.catch((err) => console.log(err));
		})
		.catch((err) => console.log(err));
};

// Deleting image when deleting post or editing
const clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	fs.unlink(filePath, (err) => console.log(err));
};
