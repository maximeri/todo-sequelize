const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered!' })
        }
        return bcrypt.compare(password, user.password).then(isMatch => {
          if (!isMatch) {
            return done(null, false, { message: 'Email or Password incorrect.' })
          }
          return done(null, user)
        })
      })
      .catch(err => done(err, false))
  }))

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRECT,
        callbackURL: process.env.FACEBOOK_CALLBACK,
        profileFields: ['email', 'displayName'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { name, email } = profile._json
          let user = await User.findOne({ where: { email } })
          if (user) return done(null, user)

          const randomPassword = Math.random().toString(36).slice(-8)
          const salt = await bcrypt.genSalt(10)
          const hash = await bcrypt.hash(randomPassword, salt)
          // for new user creation
          user = await User.create({
            name,
            email,
            password: hash,
          })
          return done(null, user)
        } catch (err) {
          return done(null, false)
        }
      }
    )
  )
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then((user) => {
        user = user.toJSON() // 此 user 物件會透過 req.user 傳到前端樣板，要先轉成 plain object，否則無法顯示
        done(null, user)
      }).catch(err => done(err, null))
  })
}