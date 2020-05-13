const express = require("express");

const paymentController = require("../controllers/payment");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post("/checkout", paymentController.checkout);
router.get("/paymentChecker", paymentController.paymentChecker);

module.exports = router;
