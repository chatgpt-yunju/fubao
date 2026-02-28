module.exports = {
  apps: [
    {
      name: 'fubao-backend',
      script: './backend/app.js',
      cwd: '/home/ubuntu/fubao-pinggu-platform',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        SSO_APP_ID: 'app_72675e4cc28cae12',
        SSO_APP_SECRET: 'b51324eaac14281d9c506249d1cd35edc6f74b99cb39db47ca17c5c4c48ce920',
        SSO_BASE_URL: 'https://avm.yunjunet.cn/api/sso',
        SSO_REDIRECT_URI: 'https://fubao.yunjunet.cn/auth/callback',
        SESSION_SECRET: 'fubao-secret-key-production-2026'
      },
      error_file: './logs/fubao-backend-error.log',
      out_file: './logs/fubao-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
