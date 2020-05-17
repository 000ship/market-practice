const express = require("express");

const homeController = require("../controllers/home");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", homeController.getIndex);
router.get("/productsPage", homeController.getProducts);
router.get("/postsPage", homeController.getPosts);
router.get("/registerForm", homeController.getRegistration);
router.get("/confirmEmail/:token", homeController.confirmEmail);
router.get("/recoverPassword/:token", homeController.recoverPassword);
router.get("/cart", homeController.getCart);
router.get("/orders", homeController.getOrders);
router.get("/sitemap.xml", homeController.getSitemap);
// RSS Feed
router.get("/feed/posts", homeController.feedPosts);
router.get("/feed/products", homeController.feedProducts);

module.exports = router;
