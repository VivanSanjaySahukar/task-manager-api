const app = require('./app')
// index can be used to start a server(port) but app.js is used purely for testing without using a port.
const port = process.env.PORT

app.listen(port, () => {
    console.log('server is up on port ' + port)
})