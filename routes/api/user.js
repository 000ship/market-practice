const express = require("express");
const { body } = require("express-validator");

const apiController = require("../../controllers/api/user");

const isAuth = require("../../middleware/is-auth");

const router = express.Router();

router.get("/users", isAuth, apiController.getUsers);
router.delete("/user/:userId", isAuth, apiController.deleteUser);
router.put("/userStatus/:userId", isAuth, apiController.updateUserStatus);
router.put("/userRole/:userId", isAuth, apiController.updateUserRole);

module.exports = router;
