
  // playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  timeout: 40 * 60 * 1000, // 2 minutos
  use: {
    headless: true, 
    screenshot: 'only-on-failure',
  },
});

  