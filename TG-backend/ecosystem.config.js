module.exports = {
  apps: [{
    name: 'dromgram-backend',
    script: 'src/index.js',
    cwd: '/root/TG-backend',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production' },
    error_file: '/var/log/dromgram/backend-error.log',
    out_file: '/var/log/dromgram/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 10,
    watch: false
  }]
};
