const express = require("express");

const apiController = require("../../api/post");

const router = express.Router();

router.get("/posts", apiController.getPosts);
router.get("/post/:postId", apiController.getPost);
router.post("/post", apiController.createPost);
router.delete("/post/:postId", apiController.deletePost);
router.put("/post/:postId", apiController.updatePost);

module.exports = router;
