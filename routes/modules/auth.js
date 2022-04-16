const express = require('express')
const router = express.Router()
const passport = require('passport')

router.get('/facebook',
  passport.authenticate('facebook'));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: ' users/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/')
  });


  module.exports = router