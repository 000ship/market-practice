const express = require("express");

const homeController = require("../controllers/home");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", homeController.getIndex);
router.get("/productsPage", homeController.getProducts);
router.get("/registerForm", homeController.getRegistration);
router.get("/confirmEmail/:token", homeController.confirmEmail);
router.get("/recoverPassword/:token", homeController.recoverPassword);
router.get("/cart", homeController.getCart);
router.get("/orders", homeController.getOrders);

module.exports = router;
