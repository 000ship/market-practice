const express = require("express");

const apiController = require("../../api/post");

const router = express.Router();

router.get("/post", apiController.getIndex);

module.exports = router;
