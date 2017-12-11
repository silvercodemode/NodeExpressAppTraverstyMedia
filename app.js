const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const config = require('./config/database')

mongoose.connect(config.database)
let db = mongoose.connection

db.once('open', () => console.log('Connected to MongoDB'))

db.on('error', err => console.log(err))

const app = express()

let Article = require('./models/article')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({extended: false}))

app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: 'sneaky secret',
  resave: true,
  saveUninitialized: true
}))

app.use(flash())

app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    let namespace = param.split('.')
    let root = namespace.shift()
    let formParam = root

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']'
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    }
  }
}))

require('./config/passport')(passport)

app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null
  next()
})

app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err)
    } else {
      res.render('index', {
        title: 'Futsu kaiju beep boop',
        articles: articles
      })
    }
  })
})

let articles = require('./routes/articles')
app.use('/articles', articles)

let users = require('./routes/users')
app.use('/users', users)

app.listen(3000, () => console.log('Server started on port 3000 YAY'))
