const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const resemble = require('resemblejs');

// salva as capturas de tela e a comparação
const screenshotDir = path.join(__dirname, '../public/screenshots');
const preDeployScreenshotPath = path.join(screenshotDir, 'pre-deploy.png');
const postDeployScreenshotPath = path.join(screenshotDir, 'post-deploy.png');
const diffScreenshotPath = path.join(screenshotDir, 'diff.png');

// tira screenshots
const takeScreenshot = async (page, filePath) => {
  await page.screenshot({ path: filePath , fullPage: true});
  console.log(`Screenshot salva em: ${filePath}`);
};

// compara screenshots
const compareScreenshots = (path1, path2, diffPath) => {
  return new Promise((resolve, reject) => {
    resemble(path1)
      .compareTo(path2)
      .onComplete(data => {
        fs.writeFileSync(diffPath, data.getBuffer());
        console.log(`Diferença salva em: ${diffPath}`);
        resolve();
      });
  });
};

// Teste principal
test('Comparar screenshots antes e depois do deploy', async ({ page }) => {
  const url = process.env.URL || 'https://example.com';  // URL fornecida pelo usuário ou um padrão

  // pasta de screenshots existe?
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // Captura de tela antes do deploy
  console.log('Tirando screenshot antes do deploy...');
  await page.goto(url);
  await takeScreenshot(page, preDeployScreenshotPath);

  // Espera 1 minuto
  console.log('Esperando 1 minuto para o próximo screenshot...');
  await new Promise(resolve => setTimeout(resolve, 1 * 60 * 1000)); // 1 minuto

  // Captura de tela depois do deploy
  console.log('Tirando screenshot depois do deploy...');
  await page.goto(url);
  await takeScreenshot(page, postDeployScreenshotPath);

  //Compara screenshots
  await compareScreenshots(preDeployScreenshotPath, postDeployScreenshotPath, diffScreenshotPath);

  //imagens salvas corretamente?
  expect(fs.existsSync(preDeployScreenshotPath)).toBe(true);
  expect(fs.existsSync(postDeployScreenshotPath)).toBe(true);
  expect(fs.existsSync(diffScreenshotPath)).toBe(true);
}); 
