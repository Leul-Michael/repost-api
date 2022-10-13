const mongoose = require("mongoose")
const Post = require("./Post")

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre("remove", async function (next) {
  const posts = await Post.find().populate("user")
  posts.map((post) => {
    post.comments.map(async (comment, index) => {
      if (comment.user.toString() === this.id) {
        post.comments.splice(index, 1)
        await post.save()
      }
    })
  })

  await Post.deleteMany({ user: this.id }).exec()

  next()
})

module.exports = mongoose.model("User", userSchema)
