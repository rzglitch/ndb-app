const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Category = require('../models/Category');
const xsrf = require('../middleware/xsrf');
const requireLogin = require('../middleware/auth');

// 카테고리 목록
router.get('/categories', async (req, res) => {
  const token = req.session.token || crypto.randomBytes(16).toString('hex');
  const categories = await Category.find().sort({ name: 1 });
  res.render('categories', { categories, token });
});

// 카테고리 추가
router.post('/category', requireLogin, xsrf, async (req, res) => {
  const checkRegex = /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\x20]*$/;
  if (!checkRegex.test(req.body.name)) {
    return res.render('error', {
      err: { message: '카테고리 값은 한글, 영문, 숫자만 허용합니다.' },
    });
  }
  try {
    await Category.create({ name: req.body.name });
    res.redirect('/categories');
  } catch (err) {
    return res.render('error', {
      err: { message: '카테고리 추가 실패: ' + err.message },
    });
  }
});

// 카테고리 삭제
router.post('/category/:id/delete', requireLogin, xsrf, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.redirect('/categories');
});

module.exports = router;
