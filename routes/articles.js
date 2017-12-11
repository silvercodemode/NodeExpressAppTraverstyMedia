const express = require('express')
const router = express.Router()

let Article = require('../models/article')
let User = require('../models/user')

router.get('/add', ensureAuthenticated, (req, res) => res.render('add_article', {title: "Add Article"}))

router.post('/add', (req, res) => {
  req.checkBody('title', 'Title is required').notEmpty()
  //req.checkBody('Author', 'Author is required').notEmpty()
  req.checkBody('Body', 'Body is required').notEmpty()

  let errors = req.validationErrors()

  if (errors) {
    res.render('add_article', {
      title:"Add Article",
      errors:errors
    })
  } else {
    let article = new Article()
    article.title = req.body.title
    article.Author = req.user._id
    article.Body = req.body.Body

    article.save((err) => {
      if (err) {
        console.log(err)
        return
      } else {
        req.flash('success', 'Article added!')
        res.redirect('/')
      }
    })
  }
})

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.Author != req.user._id) {
      req.flash('danger', 'Not Authorized')
      res.redirect('/')
    }
    res.render('edit_article', {
      title:'Edit Article',
      article:article
    })
  })
})

router.post('/edit/:id', (req, res) => {
  let article = {};
  article.title = req.body.title
  article.Author = req.user._id
  article.Body = req.body.Body

  let query = {_id:req.params.id}

  Article.update(query, article, (err) => {
    if (err) {
      console.log(err)
      return
    } else {
      req.flash('success', 'Article updated!')
      res.redirect('/')
    }
  })
})

router.delete('/:id', (req, res) => {
  if (!req.user._id) {
    res.status(500).send()
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, (err, article) => {
    if (article.Author != req.user._id) {
      res.status(500).send()
    } else {
      Article.remove(query, (err) => {
        if(err) {
          console.log(err)
        } else {
          res.send('Success')
        }
      })
    }
  })
})

router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.Author, (err, user) => {
      res.render('article', {
        article:article,
        username:user.username
      })
    })
  })
})

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    req.flash('danger', 'User not logged in')
    res.redirect('/users/login')
  }
}

module.exports = router
