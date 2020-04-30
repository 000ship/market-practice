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
		imageUrl: req.body.imageUrl,
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
	Post.findByPk(postId)
		.then((post) => {
			post.title = req.body.title;
			post.imageUrl = req.body.imageUrl;
			post.content = req.body.content;

			return post
				.save()
				.then((result) => {
					res.status(200).json({ message: "post updated successfully", post: result });
				})
				.catch((err) => console.log(err));
		})
		.catch((err) => console.log(err));
};
