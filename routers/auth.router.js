const express = require("express");
const AuthController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/citizen/register", AuthController.registerCitizen);
router.post("/citizen/login", AuthController.loginCitizen);
router.post("/admin/login", AuthController.loginAdmin);

module.exports = router;
