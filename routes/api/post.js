const express = require("express");
const { body } = require("express-validator");

const apiController = require("../../api/post");

const isAuth = require("../../middleware/is-auth");

const router = express.Router();

router.get("/posts", isAuth, apiController.getPosts);
router.get("/post/:postId", apiController.getPost);
router.post(
	"/post",
	[body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })],
	apiController.createPost
);
router.delete("/post/:postId", apiController.deletePost);
router.put(
	"/post/:postId",
	[body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })],
	apiController.updatePost
);

module.exports = router;
