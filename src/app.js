const express = require('express')
require('./db/mongoose')  // we need mongoose to run to connect to the server, we dont need any value from js to use.
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app