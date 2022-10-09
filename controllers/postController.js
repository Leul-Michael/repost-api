const asyncHandler = require("express-async-handler")

const Post = require("../models/Post")

// @desc    Get posts
// @route   GET /api/posts
// @access  Private
const getPosts = asyncHandler(async (req, res) => {
  const publicPosts = await Post.find({ isPrivate: false })
    .sort({ createdAt: -1 })
    .populate("user", "name")
    .populate("comments.user", "name")
    .limit(15)

  const myPosts = await Post.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate("user", "name")
    .populate("comments.user", "name")

  const posts = [
    ...publicPosts
      .concat(myPosts)
      .reduce((map, obj) => map.set(obj.id, obj), new Map())
      .values(),
  ]

  res.status(200).json(posts)
})

// @desc    Set post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  if (!req.body.title || !req.body.content) {
    res.status(400)
    throw new Error("Please add a all fields.")
  }

  const posts = await Post.find({ user: req.user.id })

  if (posts.length >= 5) {
    res.status(400)
    throw new Error("Posts limit reached!")
  }

  const post = await Post.create({
    title: req.body.title,
    content: req.body.content,
    isPrivate: req.body.isPrivate,
    user: req.user.id,
  })

  await post.populate("user", "name")

  res.status(200).json(post)
})

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    res.status(400)
    throw new Error("Post not found")
  }

  // Check for user
  if (!req.user) {
    res.status(401)
    throw new Error("User not found")
  }

  // Make sure the logged in user matches the post user
  if (post.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error("User not authorized")
  }

  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })

  await updatedPost.populate("user", "name")

  res.status(200).json(updatedPost)
})

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    res.status(400)
    throw new Error("Post not found")
  }

  // Check for user
  if (!req.user) {
    res.status(401)
    throw new Error("User not found")
  }

  // Make sure the logged in user matches the goal user
  if (post.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error("User not authorized")
  }

  await post.remove()

  res.status(200).json({ _id: req.params.id })
})

// @desc    Like / Unlike post
// @route   PUT /api/posts/like/postId
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId)

  if (!post) {
    res.status(400)
    throw new Error("Post not found")
  }

  // Check for user
  if (!req.user) {
    res.status(401)
    throw new Error("User not found")
  }

  const isPostNotLiked =
    post.likes.filter((like) => like.user.toString() === req.user.id).length ===
    0

  if (isPostNotLiked) {
    // Post has not been liked by the user yet, so like the post
    post.likes.unshift({ user: req.user.id })
  } else {
    // Post has been liked by the user, so unlike the post
    const postLikeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id)
    post.likes.splice(postLikeIndex, 1)
  }

  await post.save()

  res.status(200).json({ id: req.params.postId, likes: post.likes })
})

const commentPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId)

  if (!post) {
    res.status(400)
    throw new Error("Post not found")
  }

  // Check for user
  if (!req.user) {
    res.status(401)
    throw new Error("User not found")
  }

  const commentsByUser = post.comments.filter((comment) => {
    return comment.user.toString() === req.user.id
  })

  if (commentsByUser.length >= 2) {
    res.status(401)
    throw new Error("Only 2 comments are allowed per post, limit reached!")
  }

  const postComment = {
    user: req.user.id,
    body: req.body.comment,
  }

  post.comments.unshift(postComment)

  await (await post.save()).populate("comments.user", "name")

  res.status(200).json({ id: post._id, comments: post.comments })
})

const updateUserComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId)

  if (!post) {
    res.status(400)
    throw new Error("Post not found")
  }

  // Check for user
  if (!req.user) {
    res.status(401)
    throw new Error("User not found")
  }

  const comment = post.comments.find(
    (comment) => comment.id.toString() === req.params.commentId
  )

  if (!comment) {
    res.status(401)
    throw new Error("Comment not found")
  }

  if (comment.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error("User not authorized")
  }

  comment.body = req.body.body
  comment.date = Date.now()

  await (await post.save()).populate("comments.user", "name")

  res.status(200).json({ id: req.params.postId, comments: post.comments })
})

const removeUserComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId)

  if (!post) {
    res.status(400)
    throw new Error("Post not found")
  }

  // Check for user
  if (!req.user) {
    res.status(401)
    throw new Error("User not found")
  }

  const comment = post.comments.find(
    (comment) => comment.id.toString() === req.params.commentId
  )

  if (!comment) {
    res.status(401)
    throw new Error("Comment not found")
  }

  if (comment.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error("User not authorized")
  }

  const commentIndex = post.comments
    .map((comment) => comment.id.toString())
    .indexOf(comment.id)

  post.comments.splice(commentIndex, 1)

  await (await post.save()).populate("comments.user", "name")

  res.status(200).json({ id: req.params.postId, comments: post.comments })
})

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  commentPost,
  removeUserComment,
  updateUserComment,
}
