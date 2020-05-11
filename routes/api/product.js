const express = require("express");
const { body } = require("express-validator");

const apiController = require("../../controllers/api/product");

const isAuth = require("../../middleware/is-auth");

const router = express.Router();

const validations = [
	body("title").trim().isLength({ min: 5 }),
	body("price").isFloat(),
	body("content").trim().isLength({ min: 5 }),
];

router.get("/products", isAuth, apiController.getProducts);
router.get("/product/:productId", isAuth, apiController.getProduct);
router.post("/product", isAuth, validations, apiController.createProduct);
router.delete("/product/:productId", isAuth, apiController.deleteProduct);
router.put("/product/:productId", isAuth, validations, apiController.updateProduct);

module.exports = router;
