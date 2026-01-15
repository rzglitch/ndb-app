const express = require('express');
const expressSitemapXml = require('express-sitemap-xml');
const Post = require('../models/Post');
const Category = require('../models/Category');

async function getUrls () {
  const findPost = await Post.find({ status: 'public' })
  .select('_id')
  .lean();
  const findCategory = await Category.find({})
  .select('name')
  .lean();

  const posts = findPost.map(d => `/post/${d._id}`);
  const categories = findCategory.map(d => `/?category=${d.name}`);

  const sitemap = [
    '/',
    '/categories',
    ...categories,
    ...posts
  ];

  return sitemap;
}

module.exports = getUrls;
