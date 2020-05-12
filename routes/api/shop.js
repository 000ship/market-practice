const express = require("express");

const apiController = require("../../controllers/api/shop");

const isAuth = require("../../middleware/is-auth");

const router = express.Router();

router.post("/addToCart", isAuth, apiController.addToCart);

module.exports = router;
