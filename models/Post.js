const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: '익명' },
  category: { type: String, default: '일반' },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, required: true },
});

module.exports = mongoose.model('Post', postSchema);
