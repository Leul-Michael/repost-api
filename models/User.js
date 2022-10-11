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
  await Post.deleteMany({ user: this.id }).exec()

  next()
})

module.exports = mongoose.model("User", userSchema)
