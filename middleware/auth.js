function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

function permRegister(req, res, next) {
  if (parseInt(process.env.REG_REQUIRE_LOGIN) && !req.session.user) {
    return res.redirect("/login");
  }
  next();
}

module.exports = { requireLogin, permRegister };
