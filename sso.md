# SSO 单点登录集成指南

## hunjian.yunjunet.cn 应用凭证

**⚠️ 请妥善保存以下凭证信息**

```
app_id: app_72675e4cc28cae12
app_secret: b51324eaac14281d9c506249d1cd35edc6f74b99cb39db47ca17c5c4c48ce920
应用名称: 婚检网站
每日扣积分上限: 200
授权回调地址:
  - https://hunjian.yunjunet.cn/auth/callback
  - http://hunjian.yunjunet.cn/auth/callback
  - http://localhost:8080/auth/callback (开发测试)
```

---

## 快速集成（Node.js/Express）

### 1. 安装依赖

```bash
npm install axios express express-session
```

### 2. 环境变量配置

创建 `.env` 文件：
```env
SSO_APP_ID=app_72675e4cc28cae12
SSO_APP_SECRET=b51324eaac14281d9c506249d1cd35edc6f74b99cb39db47ca17c5c4c48ce920
SSO_BASE_URL=https://avm.yunjunet.cn/api/sso
SSO_REDIRECT_URI=https://hunjian.yunjunet.cn/auth/callback
SESSION_SECRET=your-random-secret-key
```

### 3. SSO 客户端代码

创建 `lib/sso-client.js`：

```javascript
const axios = require('axios');

class SSOClient {
  constructor() {
    this.appId = process.env.SSO_APP_ID;
    this.appSecret = process.env.SSO_APP_SECRET;
    this.baseUrl = process.env.SSO_BASE_URL;
    this.redirectUri = process.env.SSO_REDIRECT_URI;
  }

  // 生成授权 URL
  getAuthUrl(state = '') {
    const params = new URLSearchParams({
      app_id: this.appId,
      redirect_uri: this.redirectUri,
      state: state
    });
    return `${this.baseUrl}/authorize?${params}`;
  }

  // 用 code 换取 token
  async getToken(code) {
    const response = await axios.post(`${this.baseUrl}/token`, {
      app_id: this.appId,
      app_secret: this.appSecret,
      code: code
    });
    return response.data;
  }

  // 获取用户信息
  async getUserInfo(token) {
    const response = await axios.get(`${this.baseUrl}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // 扣除用户积分
  async deductQuota(userId, amount, reason) {
    const response = await axios.post(`${this.baseUrl}/quota/deduct`, {
      app_id: this.appId,
      app_secret: this.appSecret,
      user_id: userId,
      amount: amount,
      reason: reason
    });
    return response.data;
  }
}

module.exports = new SSOClient();
```

### 4. Express 路由集成

创建 `routes/auth.js`：

```javascript
const express = require('express');
const router = express.Router();
const ssoClient = require('../lib/sso-client');

// 登录：跳转到 SSO 授权页面
router.get('/login', (req, res) => {
  const state = Math.random().toString(36).slice(2);
  req.session.oauth_state = state;
  const authUrl = ssoClient.getAuthUrl(state);
  res.redirect(authUrl);
});

// 回调：处理 SSO 返回的 code
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    // 验证 state 防止 CSRF
    if (state !== req.session.oauth_state) {
      return res.status(400).send('Invalid state');
    }
    delete req.session.oauth_state;

    // 用 code 换取 token
    const tokenData = await ssoClient.getToken(code);

    // 获取用户信息
    const userInfo = await ssoClient.getUserInfo(tokenData.token);

    // 保存到 session
    req.session.user = userInfo;
    req.session.token = tokenData.token;

    res.redirect('/dashboard');
  } catch (error) {
    console.error('SSO callback error:', error.response?.data || error.message);
    res.status(500).send('登录失败');
  }
});

// 登出
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
```

### 5. 认证中间件

创建 `middleware/auth.js`：

```javascript
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

function requireQuota(minQuota) {
  return async (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    // 重新获取最新积分
    const ssoClient = require('../lib/sso-client');
    try {
      const userInfo = await ssoClient.getUserInfo(req.session.token);
      req.session.user = userInfo;

      if (userInfo.extra_quota < minQuota) {
        return res.status(402).json({
          message: '积分不足',
          required: minQuota,
          current: userInfo.extra_quota
        });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: '请重新登录' });
    }
  };
}

module.exports = { requireAuth, requireQuota };
```

### 6. 主应用配置

在 `app.js` 中：

```javascript
const express = require('express');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 天
  }
}));

// 路由
app.use('/auth', require('./routes/auth'));

// 受保护的路由示例
const { requireAuth, requireQuota } = require('./middleware/auth');

app.get('/dashboard', requireAuth, (req, res) => {
  res.json({
    message: '欢迎',
    user: req.session.user
  });
});

app.post('/api/generate-video', requireQuota(5), async (req, res) => {
  const ssoClient = require('./lib/sso-client');

  try {
    // 扣除积分
    const result = await ssoClient.deductQuota(
      req.session.user.id,
      5,
      '婚检网站 - 生成视频'
    );

    // 更新 session 中的积分
    req.session.user.extra_quota = result.remaining;

    // 执行业务逻辑
    // ...

    res.json({
      message: '视频生成成功',
      remaining_quota: result.remaining
    });
  } catch (error) {
    res.status(500).json({ message: '操作失败' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## 前端集成示例（Vue 3）

### 登录按钮

```vue
<template>
  <div>
    <button v-if="!user" @click="login">使用云聚账号登录</button>
    <div v-else>
      <p>欢迎，{{ user.username }}</p>
      <p>剩余积分：{{ user.extra_quota }}</p>
      <button @click="logout">退出</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const user = ref(null);

onMounted(async () => {
  try {
    const res = await axios.get('/api/user/me');
    user.value = res.data;
  } catch (error) {
    // 未登录
  }
});

function login() {
  window.location.href = '/auth/login';
}

function logout() {
  window.location.href = '/auth/logout';
}
</script>
```

---

## OAuth 2.0 流程图

```
用户访问 hunjian.yunjunet.cn
         ↓
点击"登录"按钮
         ↓
跳转到 avm.yunjunet.cn/api/sso/authorize
         ↓
用户输入账号密码（在 avm.yunjunet.cn）
         ↓
授权成功，跳转回 hunjian.yunjunet.cn/auth/callback?code=xxx
         ↓
后端用 code 换取 token
         ↓
用 token 获取用户信息
         ↓
保存到 session，登录完成
```

---

## API 接口说明

### 1. 获取授权 URL

**前端调用：**
```javascript
window.location.href = '/auth/login';
```

**后端生成：**
```
https://avm.yunjunet.cn/api/sso/authorize?app_id=app_72675e4cc28cae12&redirect_uri=https://hunjian.yunjunet.cn/auth/callback&state=random
```

### 2. Code 换 Token

```bash
POST https://avm.yunjunet.cn/api/sso/token
Content-Type: application/json

{
  "app_id": "app_72675e4cc28cae12",
  "app_secret": "b51324eaac14281d9c506249d1cd35edc6f74b99cb39db47ca17c5c4c48ce920",
  "code": "received_code"
}
```

**响应：**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 123,
    "username": "zhangsan",
    "role": "user"
  }
}
```

### 3. 获取用户信息

```bash
GET https://avm.yunjunet.cn/api/sso/userinfo
Authorization: Bearer {token}
```

**响应：**
```json
{
  "id": 123,
  "username": "zhangsan",
  "role": "user",
  "extra_quota": 50
}
```

### 4. 扣除积分

```bash
POST https://avm.yunjunet.cn/api/sso/quota/deduct
Content-Type: application/json

{
  "app_id": "app_72675e4cc28cae12",
  "app_secret": "b51324eaac14281d9c506249d1cd35edc6f74b99cb39db47ca17c5c4c48ce920",
  "user_id": 123,
  "amount": 5,
  "reason": "婚检网站 - 生成视频"
}
```

**响应：**
```json
{
  "message": "扣积分成功",
  "remaining": 45
}
```

---

## 安全注意事项

1. **app_secret 保护**
   - 绝不在前端代码中暴露
   - 存储在环境变量中
   - 仅在后端服务器使用

2. **CSRF 防护**
   - 使用 state 参数验证回调请求
   - 每次授权生成随机 state

3. **Token 管理**
   - Token 有效期 7 天
   - 存储在 session 中，不要存储在 localStorage
   - 定期刷新用户信息

4. **HTTPS**
   - 生产环境必须使用 HTTPS
   - 回调 URL 使用 HTTPS

5. **积分扣除**
   - 每日扣除上限：200 积分
   - 扣除前检查用户余额
   - 记录详细的扣除原因

---

## 测试步骤

### 1. 本地测试

```bash
# 启动你的应用
npm start

# 访问登录页面
open http://localhost:8080/auth/login

# 应该跳转到 avm.yunjunet.cn 登录页面
# 登录后会跳回 http://localhost:8080/auth/callback
```

### 2. 测试积分扣除

```bash
curl -X POST http://localhost:8080/api/generate-video \
  -H "Cookie: connect.sid=your_session_id" \
  -H "Content-Type: application/json"
```

### 3. 查看积分日志

在 avm.yunjunet.cn 数据库中：
```sql
SELECT * FROM oauth_deduct_logs
WHERE app_id = 'app_72675e4cc28cae12'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 常见问题

### Q1: redirect_uri 不匹配
**错误：** `redirect_uri 未授权`

**解决：** 确保回调 URL 完全匹配（包括协议、域名、路径）。已授权的 URL：
- `https://hunjian.yunjunet.cn/auth/callback`
- `http://hunjian.yunjunet.cn/auth/callback`
- `http://localhost:8080/auth/callback`

### Q2: code 已过期
**错误：** `code 已过期`

**解决：** code 有效期 5 分钟，且只能使用一次。收到 code 后立即换取 token。

### Q3: 积分不足
**错误：** `积分不足`

**解决：**
- 用户需要在 avm.yunjunet.cn 充值
- 或联系管理员增加积分

### Q4: 每日扣除上限
**错误：** `今日扣积分已达上限`

**解决：** 当前应用每日最多扣除 200 积分，次日 00:00 重置。

---

## 技术支持

如需修改配置（回调 URL、每日上限等），请联系管理员。

管理员可通过以下接口管理应用：

```bash
# 查看应用列表
GET /api/sso/apps
Authorization: Bearer {admin_token}

# 停用/启用应用
PATCH /api/sso/apps/1
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "is_active": 0  // 0=停用, 1=启用
}
