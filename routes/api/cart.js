const express = require("express");

const apiController = require("../../controllers/api/cart");

const isAuth = require("../../middleware/is-auth");

const router = express.Router();

router.post("/addToCart", isAuth, apiController.addToCart);
router.get("/getCart", isAuth, apiController.getCart);

module.exports = router;
