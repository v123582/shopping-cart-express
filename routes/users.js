var express = require('express');
var router = express.Router();

const userController = require('../controllers/userController.js')
const passport = require('../config/passport')

router.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/logout', userController.logout)

module.exports = router;
