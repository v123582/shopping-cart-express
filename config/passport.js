const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User

passport.use(new LocalStrategy({
  passReqToCallback: true,
  usernameField: 'email',
  passwordField: 'password'
},
  (req, username, password, cb) => {
    User.findOne({where: {email: username}}).then(user => {
      if (!user) return cb(null, false)
      if (!bcrypt.compareSync(password, user.password)) return cb(null, false)
      return cb(null, user)
    })
  }
))

passport.serializeUser((user, cb) => {
  return cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  User.findByPk(id).then(user => {
    return cb(null, user)
  })
})

module.exports = passport