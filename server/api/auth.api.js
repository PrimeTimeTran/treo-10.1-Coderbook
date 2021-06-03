var express = require("express");
var router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/login", authController.loginWithEmail);
router.get("/production-apo", authController.production);

module.exports = router;
