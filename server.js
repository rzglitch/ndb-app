const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
require('dotenv').config();

const app = express();

// DB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

// 미들웨어
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const fileStoreOptions = {};

app.use(
  session({
    secret: process.env.SESS_SECRET, // 환경변수로 관리 권장
    resave: false,
    saveUninitialized: false,
    cookie: { secure: parseInt(process.env.SECURE_COOKIE), httpOnly: true },
    store: new FileStore(fileStoreOptions),
  })
);

// 뷰 엔진
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  res.locals.defaultHost = process.env.HOST;
  next();
});

// 라우트
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

app.use('/', authRoutes);
app.use('/', postRoutes);
app.use('/', categoryRoutes);

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
