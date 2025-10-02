const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const requireLogin = require('../middleware/auth');
const xsrf = require('../middleware/xsrf');
const router = express.Router();

// 회원가입 폼
router.get('/register', requireLogin, (req, res) => {
  const token = req.session.token || crypto.randomBytes(16).toString('hex');
  req.session.token = token;
  res.render('register', { token });
});

// 회원가입 처리
router.post('/register', requireLogin, xsrf, async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPw = await bcrypt.hash(password, 10);
  try {
    const user = new User({ username, password: hashedPw, email });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    return res.render('error', {
      err: { message: '회원가입 실패' },
    });
  }
});

// 로그인 폼
router.get('/login', (req, res) => {
  const token = req.session.token || crypto.randomBytes(16).toString('hex');
  req.session.token = token;
  res.render('login', { token });
});

// 로그인 처리
router.post('/login', xsrf, async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user)
    return res.render('error', {
      err: { message: '사용자를 찾을 수 없습니다.' },
    });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.render('error', {
      err: { message: '비밀번호가 올바르지 않습니다.' },
    });

  req.session.user = { id: user._id, username: user.username };
  res.redirect('/');
});

// 로그아웃
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
