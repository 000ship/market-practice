const express = require("express");

const apiController = require("../../api/post");

const router = express.Router();

router.get("/posts", apiController.getPosts);
router.post("/post", apiController.createPost);

module.exports = router;
