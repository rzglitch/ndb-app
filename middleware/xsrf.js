function xsrf(req, res, next) {
  if (!req.session.token) {
    return res.render('error', {
      err: { message: 'CSRF 토큰 값이 없습니다.' },
    });
  }
  const token = req.body._token || null;

  if (req.session.token !== token) {
    return res.render('error', {
      err: { message: 'CSRF 토큰 값이 올바르지 않습니다.' },
    });
  }
  next();
}

module.exports = xsrf;
