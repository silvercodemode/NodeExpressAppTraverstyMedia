let mongoose = require('mongoose')

let articleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  Author: {
    type: String,
    required: true
  },
  Body: {
    type: String,
    required: true
  }
})

let article = module.exports = mongoose.model('Article', articleSchema)
