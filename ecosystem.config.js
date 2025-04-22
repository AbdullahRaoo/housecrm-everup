module.exports = {
  apps: [
    {
      name: "crm-backend",
      cwd: "/home/tabish/Projects/CRM_Realstate/server",
      script: "index.js",
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
      watch: false,
      instances: 1,
      exec_mode: "fork",
    },
    {
      name: "crm-frontend",
      cwd: "/home/tabish/Projects/CRM_Realstate/frontend",
      script: "npm",
      args: "run preview",
      env: {
        NODE_ENV: "production",
      },
      watch: false,
    },
  ],
};
