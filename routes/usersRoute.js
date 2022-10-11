const express = require("express")
const router = express.Router()
const {
  registerUser,
  loginUser,
  getMe,
  deactivateAccount,
} = require("../controllers/userController")

const { protect } = require("../middleware/authMiddleware")

router.post("/", registerUser)
router.post("/login", loginUser)
router.get("/me", protect, getMe)
router.delete("/deactivate/:userId", protect, deactivateAccount)

module.exports = router
