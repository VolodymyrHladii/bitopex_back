module.exports = {
  apps: [
    {
      name: "dev",
      script: "npm run start",
      env: { NODE_ENV: "development" },
    },
    {
      name: "staging",
      script: "npm run start",
      env: { NODE_ENV: "staging" },
    },
    {
      name: "prod",
      script: "npm run start",
      env: { NODE_ENV: "production" },
    },
  ],
};
