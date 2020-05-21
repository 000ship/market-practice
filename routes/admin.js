const express = require("express");

const adminController = require("../controllers/admin");

const router = express.Router();

router.get("/", adminController.getIndex);
router.get("/posts", adminController.getPosts);
router.get("/userInfo", adminController.getUserInfo);
router.get("/products", adminController.getProducts);
router.get("/users", adminController.getUsers);

module.exports = router;
