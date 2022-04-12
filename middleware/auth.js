module.exports = {
  authenticator:(req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect("/users/login")
  }
}
}

