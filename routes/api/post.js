const express = require("express");
const { body } = require("express-validator");

const apiController = require("../../controllers/api/post");

const isAuth = require("../../middleware/is-auth");

const router = express.Router();

router.get("/posts", isAuth, apiController.getPosts);
router.get("/post/:postId", isAuth, apiController.getPost);
router.get("/paginatedPosts", apiController.getPaginatedPosts);
router.post(
	"/post",
	isAuth,
	[body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })],
	apiController.createPost
);
router.delete("/post/:postId", isAuth, apiController.deletePost);
router.put(
	"/post/:postId",
	isAuth,
	[body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })],
	apiController.updatePost
);

module.exports = router;
