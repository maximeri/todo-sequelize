const express = require('express')
// dotenv start
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const { engine } = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const app = express()
const PORT = process.env.PORT
const routes = require('./routes')
const session = require('express-session')
const usePassport = require('./config/passport')

app.engine('.hbs', engine({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', '.hbs')
app.set('views', './views')
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))
usePassport(app)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.use((req,res,next)=>{
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  next()
})

app.use(routes)

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
  // console.log(process.env)
})