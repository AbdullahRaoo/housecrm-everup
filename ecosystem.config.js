module.exports = {
  apps: [
    {
      name: "crm-backend",
      cwd: "/var/www/CRM_Realstate/server",
      script: "index.js",
      env: {
        NODE_ENV: "production",
        PORT: 5432,
      },
      watch: false,
      instances: 1,
      exec_mode: "fork",
    },
    {
      name: "crm-frontend",
      cwd: "/var/www/CRM_Realstate/frontend",
      script: "npm",
      args: "run preview -- --host 0.0.0.0 --port 3000 --strictPort",
      env: {
        NODE_ENV: "production",
      },
      watch: false,
    },
  ],
};
