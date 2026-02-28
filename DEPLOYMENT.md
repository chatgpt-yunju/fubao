# 福报系统部署文档

## 部署信息

- **域名**: https://fubao.yunjunet.cn
- **后端端口**: 3001
- **前端**: Nginx 静态文件服务
- **进程管理**: PM2

## 部署架构

```
用户请求 → Nginx (80) → 静态文件 (/)
                       → 后端代理 (/api, /auth) → Express (3001)
```

## 部署步骤

### 1. 构建前端

```bash
cd /home/ubuntu/fubao-pinggu-platform/fubao
npm run build
```

### 2. 启动后端

```bash
cd /home/ubuntu/fubao-pinggu-platform
pm2 start ecosystem.config.js
pm2 save
```

### 3. 配置 Nginx

配置文件位置: `/etc/nginx/sites-available/fubao.yunjunet.cn`

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 管理命令

### PM2 管理

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs fubao-backend

# 重启服务
pm2 restart fubao-backend

# 停止服务
pm2 stop fubao-backend

# 删除服务
pm2 delete fubao-backend
```

### 更新部署

```bash
# 1. 更新代码
cd /home/ubuntu/fubao-pinggu-platform
git pull

# 2. 更新后端依赖（如果需要）
cd backend
npm install

# 3. 重新构建前端
cd ../fubao
npm run build

# 4. 重启后端
pm2 restart fubao-backend
```

## 日志位置

- 后端日志: `/home/ubuntu/fubao-pinggu-platform/logs/`
- Nginx 日志: `/var/log/nginx/fubao-*.log`

## 测试

```bash
# 测试后端
curl http://localhost:3001/health

# 测试前端
curl -I http://fubao.yunjunet.cn/

# 测试 API
curl http://fubao.yunjunet.cn/api/user/me

# 测试登录重定向
curl -I http://fubao.yunjunet.cn/auth/login
```

## SSO 配置

- **App ID**: app_72675e4cc28cae12
- **回调地址**: https://fubao.yunjunet.cn/auth/callback
- **SSO 服务器**: https://avm.yunjunet.cn/api/sso

## 环境变量

环境变量在 `ecosystem.config.js` 中配置，包括：
- SSO_APP_ID
- SSO_APP_SECRET
- SSO_BASE_URL
- SSO_REDIRECT_URI
- SESSION_SECRET
- NODE_ENV
- PORT

## 故障排查

### 后端无法启动

```bash
# 查看日志
pm2 logs fubao-backend --lines 50

# 检查端口占用
lsof -i :3001

# 重启服务
pm2 restart fubao-backend
```

### 前端无法访问

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 测试 Nginx 配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### SSO 登录失败

1. 检查回调地址是否正确配置
2. 检查环境变量是否正确加载
3. 查看后端日志中的错误信息

## 安全注意事项

1. SESSION_SECRET 已设置为生产环境密钥
2. 使用 HTTPS（需要配置 SSL 证书）
3. app_secret 仅在后端使用，不暴露给前端
4. Cookie 设置为 secure（生产环境）
