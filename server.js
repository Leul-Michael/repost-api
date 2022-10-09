require("dotenv").config()
const express = require("express")
const { errorHandler } = require("./middleware/errorMiddleware")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URL).then(
  () => {
    console.log("Connected to DB...")
  },
  (err) => {
    console.log(err)
  }
)
// mongoose.connect(process.env.MONGO_URL_LOCAL).then(
//   () => {
//     console.log("Connected to DB...")
//   },
//   (err) => {
//     console.log(err)
//   }
// )

// EXPRESS JSON HANDLER
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }))

// GOALS ROUTE
app.use("/api/posts", require("./routes/postsRoute"))
app.use("/api/users", require("./routes/usersRoute"))

app.use(errorHandler)

app.listen(PORT, console.log(`Server started on port ${PORT}...`))
