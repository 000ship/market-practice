const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
	Post.findAll()
		.then((posts) => {
			res.status(200).json(posts);
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
