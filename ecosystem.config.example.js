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
        SSO_APP_ID: 'your_app_id_here',
        SSO_APP_SECRET: 'your_app_secret_here',
        SSO_BASE_URL: 'http://your-sso-server.com/api/sso',
        SSO_REDIRECT_URI: 'http://your-domain.com/auth/callback',
        SESSION_SECRET: 'change-this-secret-key'
      },
      error_file: './logs/fubao-backend-error.log',
      out_file: './logs/fubao-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
