#!/bin/bash

echo "======================================"
echo "福报系统 SSO 登录功能测试"
echo "======================================"
echo ""

# 测试后端健康检查
echo "1. 测试后端健康检查..."
curl -s http://localhost:3001/health | jq .
echo ""

# 测试根路径
echo "2. 测试后端根路径..."
curl -s http://localhost:3001/ | jq .
echo ""

# 测试用户信息接口（未登录）
echo "3. 测试用户信息接口（未登录）..."
curl -s http://localhost:3001/api/user/me | jq .
echo ""

# 测试前端服务
echo "4. 测试前端服务..."
curl -I http://localhost:8080/ 2>&1 | grep "HTTP"
echo ""

echo "======================================"
echo "测试完成！"
echo "======================================"
echo ""
echo "访问地址："
echo "- 前端: http://localhost:8080"
echo "- 后端: http://localhost:3001"
echo ""
echo "登录流程："
echo "1. 访问 http://localhost:8080"
echo "2. 点击右上角"登录"按钮"
echo "3. 跳转到 avm.yunjunet.cn 登录"
echo "4. 登录成功后自动跳回"
echo "5. 显示用户名和积分"
