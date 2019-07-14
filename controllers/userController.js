const bcrypt = require('bcrypt-nodejs') 
const db = require('../models')
const User = db.User

let userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if(req.body.passwordCheck !== req.body.password){
      return res.redirect('/signup')
    } else {
      User.findOne({where: {email: req.body.email}}).then(user => {
        if(user){
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            return res.redirect('/signin')
          })  
        }
      })    
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },
 
  signIn: (req, res) => {
    res.redirect('/products');
  },
 
  logout: (req, res) => {
    req.logout()
    res.redirect('/signin')
  },
}

module.exports = userController