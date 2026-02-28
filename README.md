# 福报系统 SSO 登录集成

## 项目结构

```
fubao-pinggu-platform/
├── backend/              # Express.js 后端
│   ├── app.js           # 主应用入口
│   ├── .env             # 环境变量配置
│   ├── lib/
│   │   └── sso-client.js    # SSO 客户端
│   ├── routes/
│   │   ├── auth.js          # 认证路由
│   │   └── user.js          # 用户 API
│   └── middleware/
│       └── auth.js          # 认证中间件
└── fubao/               # React 前端
    ├── App.tsx          # 主应用（已集成登录）
    ├── api/
    │   └── auth.ts      # 前端 API 工具
    └── vite.config.ts   # Vite 配置（代理到后端）
```

## 快速启动

### 1. 启动后端（端口 3001）

```bash
cd backend
npm install
npm start
```

### 2. 启动前端（端口 8080）

```bash
cd fubao
npm install
npm run dev
```

### 3. 访问应用

打开浏览器访问: http://localhost:8080

## SSO 登录流程

1. 用户点击"登录"按钮
2. 跳转到 avm.yunjunet.cn SSO 授权页面
3. 用户输入账号密码
4. 授权成功后跳回 http://localhost:8080/auth/callback
5. 后端用 code 换取 token
6. 获取用户信息并保存到 session
7. 前端显示用户名和积分

## 环境变量配置

`backend/.env`:

```env
SSO_APP_ID=app_72675e4cc28cae12
SSO_APP_SECRET=b51324eaac14281d9c506249d1cd35edc6f74b99cb39db47ca17c5c4c48ce920
SSO_BASE_URL=https://avm.yunjunet.cn/api/sso
SSO_REDIRECT_URI=http://localhost:8080/auth/callback
SESSION_SECRET=fubao-secret-key-change-in-production
PORT=3001
```

## API 接口

### 后端接口

- `GET /health` - 健康检查
- `GET /auth/login` - 跳转到 SSO 登录
- `GET /auth/callback` - SSO 回调处理
- `GET /auth/logout` - 登出
- `GET /api/user/me` - 获取当前用户信息（需登录）

### 前端 API

```typescript
import { fetchCurrentUser, login, logout } from './api/auth';

// 获取当前用户
const user = await fetchCurrentUser();

// 登录
login();

// 登出
logout();
```

## 测试

### 测试后端接口

```bash
# 健康检查
curl http://localhost:3001/health

# 获取用户信息（未登录）
curl http://localhost:3001/api/user/me
```

### 测试前端构建

```bash
cd fubao
npm run build
```

## 生产部署

### 修改环境变量

```env
SSO_REDIRECT_URI=https://hunjian.yunjunet.cn/auth/callback
NODE_ENV=production
SESSION_SECRET=your-strong-random-secret
```

### 启动服务

```bash
# 后端
cd backend
npm start

# 前端构建
cd fubao
npm run build
```

## 功能特性

✅ SSO 单点登录集成
✅ Session 会话管理（7天有效期）
✅ CSRF 防护（state 参数）
✅ 用户信息显示
✅ 积分显示
✅ 登录/登出功能
✅ 保留原有 localStorage 功能

## 注意事项

1. 后端使用端口 3001（避免与 avm.yunjunet.cn 的 3000 端口冲突）
2. 前端使用端口 8080（与 SSO 回调地址匹配）
3. 开发环境允许 HTTP，生产环境建议使用 HTTPS
4. app_secret 仅在后端使用，不暴露给前端
5. 原有的 localStorage 数据功能保留，不影响现有用户
