const express = require("express")
const router = express.Router()
const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  commentPost,
  removeUserComment,
  updateUserComment,
} = require("../controllers/postController")

const { protect } = require("../middleware/authMiddleware")

router.route("/").get(protect, getPosts).post(protect, createPost)
router.route("/:id").delete(protect, deletePost).put(protect, updatePost)
router.route("/like/:postId").put(protect, likePost)
router.route("/comment/:postId").post(protect, commentPost)
router
  .route("/comment/:postId/:commentId")
  .put(protect, updateUserComment)
  .delete(protect, removeUserComment)

module.exports = router
