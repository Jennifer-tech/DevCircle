const express = require('express');
const { registerUser, loginUser, refreshTokenUser, logoutUser} = require('../controllers/authController')

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser)
router.post("/refresh-token", refreshTokenUser)
router.post("/logout", logoutUser)

module.exports = router;