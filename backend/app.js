const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'https://hunjian.yunjunet.cn', 'http://fubao.yunjunet.cn', 'https://fubao.yunjunet.cn'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'fubao-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // HTTP 环境下必须为 false
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// 路由
app.use('/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '福报系统后端运行中' });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '福报系统 API',
    version: '1.0.0',
    endpoints: {
      login: '/auth/login',
      callback: '/auth/callback',
      logout: '/auth/logout',
      userInfo: '/api/user/me'
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`福报系统后端运行在 http://localhost:${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`SSO 回调地址: ${process.env.SSO_REDIRECT_URI}`);
});
