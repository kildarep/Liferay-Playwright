
  // playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  timeout: 2 * 60 * 1000, // 2 minutos
  use: {
    headless: true, 
    screenshot: 'only-on-failure',
  },
});

  