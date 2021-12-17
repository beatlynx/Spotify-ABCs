const express = require('express')
const env = require('dotenv').config()
const app = express()
const port = 3000 | process.env.PORT

var session = require('express-session')

app.use(session ({
  secret: 'ab$cs',
  secure: 'false',
  httpOnly: 'false'
}))

app.get('/', (req,res) => {
  res.send('Hello world')
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
