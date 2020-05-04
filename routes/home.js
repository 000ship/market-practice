const express = require("express");

const homeController = require("../controllers/home");

const router = express.Router();

router.get("/", homeController.getIndex);
router.get("/registerForm", homeController.getRegistration);

module.exports = router;
