const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const Post = require('../models/Post');
const Category = require('../models/Category');
const requireLogin = require('../middleware/auth');
const sanitizeHtml = require('sanitize-html');
const htmlToText = require('html-to-text');

const xsrf = require('../middleware/xsrf');

const formatDate = (i) => {
  dayjs.extend(utc);
  return {
    timestamp: dayjs(i).utc().unix(),
    formatted: dayjs(i).utc().format(),
  };
};

// 글 목록
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const category = req.query.category || null;

  const filter = category ? { category } : {};
  if (!req.session.user) filter.status = 'public';

  const totalPosts = await Post.countDocuments(filter);
  const totalPages = Math.ceil(totalPosts / limit);

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.render('index', {
    posts,
    currentPage: page,
    totalPages,
    category,
    formatDate,
  });
});

// 글 작성 폼
router.get('/create', requireLogin, async (req, res) => {
  const token = req.session.token || crypto.randomBytes(16).toString('hex');
  const categories = await Category.find().sort({ name: 1 });
  res.render('create', { categories, token });
});

// 글 작성 처리
router.post('/', requireLogin, xsrf, async (req, res) => {
  await Post.create({
    title: req.body.title,
    content: req.body.content,
    author: req.session.user.username,
    category: req.body.category,
    status: req.body.status,
  });
  res.redirect('/');
});

// 글 상세 보기
router.get('/post/:id', async (req, res) => {
  const token = req.session.token || crypto.randomBytes(16).toString('hex');
  try {
    const post = await Post.findById(req.params.id);

    if ((!post.status || post.status !== 'public') && !req.session.user)
      return res.status(404).render('error', {
        err: { message: '글을 찾을 수 없습니다.' },
      });

    const textOptions = {
      wordwrap: false,
    };
    post.content = sanitizeHtml(post.content);
    const contentText = htmlToText.convert(post.content, textOptions);
    const seo = {
      title: post.title.trim(),
      content: contentText.replaceAll('\n', ' ').trim(),
    };
    res.render('detail', { post, seo, token, formatDate });
  } catch (e) {
    console.log(e);
    return res.status(400).render('error', {
      err: { message: '내부 오류가 발생했습니댜.' },
    });
  }
});

// 글 수정 폼
router.get('/post/:id/edit', requireLogin, async (req, res) => {
  const token = req.session.token || crypto.randomBytes(16).toString('hex');
  const post = await Post.findById(req.params.id);
  const categories = await Category.find().sort({ name: 1 });

  post.content = sanitizeHtml(post.content);
  res.render('edit', { post, categories, token });
});

// 글 수정 처리
router.put('/post/:id', requireLogin, xsrf, async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    status: req.body.status,
  });
  res.redirect(`/post/${req.params.id}`);
});

// 글 삭제
router.delete('/post/:id', requireLogin, xsrf, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// 카테고리 목록

module.exports = router;
