const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const resemble = require('resemblejs');
const { diffWordsWithSpace } = require('diff'); 

const screenshotDir = path.join(__dirname, '../public/screenshots');
const htmlDir = path.join(__dirname, '../public/html');
const preDeployScreenshotPath = path.join(screenshotDir, 'pre-deploy.png');
const postDeployScreenshotPath = path.join(screenshotDir, 'post-deploy.png');
const diffScreenshotPath = path.join(screenshotDir, 'diff.png');
const preDeployHtmlPath = path.join(htmlDir, 'pre-deploy.html');
const postDeployHtmlPath = path.join(htmlDir, 'post-deploy.html');
const diffHtmlReportPath = path.join(htmlDir, 'diff-report.html');

// captura o HTML da página
const captureHTML = async (page, filePath) => {
  const htmlContent = await page.content(); // Captura o HTML da página
  fs.writeFileSync(filePath, htmlContent, 'utf-8');
  console.log(`HTML capturado e salvo em: ${filePath}`);
};

// gera o relatório de diferença de HTML
const generateHtmlDiffReport = (preDeployHtml, postDeployHtml, diffReportPath) => {
  const diff = diffWordsWithSpace(preDeployHtml, postDeployHtml);
  let htmlContent = '<html><body><h1>Diferenças HTML</h1><pre>';

  diff.forEach(part => {
    const color = part.added ? 'green' :
                  part.removed ? 'red' : 'grey';
    htmlContent += `<span style="color:${color}">${part.value}</span>`;
  });

  htmlContent += '</pre></body></html>';
  fs.writeFileSync(diffReportPath, htmlContent, 'utf-8');
  console.log(`Relatório de diferenças HTML gerado em: ${diffReportPath}`);
};

// Função para tirar screenshots
const takeScreenshot = async (page, filePath) => {
  await page.screenshot({ path: filePath, fullPage: true }); // Captura a tela inteira
  console.log(`Screenshot salvo em: ${filePath}`);
};

// Função para comparar screenshots
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

test('Comparar screenshots e HTML antes e depois do deploy', async ({ page }) => {
  const url = process.env.URL || 'https://example.com';  

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
  }

  // Captura antes do deploy
  console.log('Tirando screenshot e capturando HTML antes do deploy...');
  await page.goto(url);
  await takeScreenshot(page, preDeployScreenshotPath);
  await captureHTML(page, preDeployHtmlPath);

  // Espera 30 minutos
  console.log('Espera 30 minutos próximo screenshot');
  await new Promise(resolve => setTimeout(resolve, 1 * 60 * 1000));

  // Captura de tela e HTML depois do deploy
  console.log('Tirando screenshot e capturando HTML depois do deploy...');
  await page.goto(url);
  await takeScreenshot(page, postDeployScreenshotPath);
  await captureHTML(page, postDeployHtmlPath);

  // Compara screenshots
  await compareScreenshots(preDeployScreenshotPath, postDeployScreenshotPath, diffScreenshotPath);

  // Compara HTML e gera relatório de diferença
  const preDeployHtml = fs.readFileSync(preDeployHtmlPath, 'utf-8');
  const postDeployHtml = fs.readFileSync(postDeployHtmlPath, 'utf-8');
  generateHtmlDiffReport(preDeployHtml, postDeployHtml, diffHtmlReportPath);

  // Verifica se os arquivos foram salvos
  expect(fs.existsSync(preDeployScreenshotPath)).toBe(true);
  expect(fs.existsSync(postDeployScreenshotPath)).toBe(true);
  expect(fs.existsSync(diffScreenshotPath)).toBe(true);
  expect(fs.existsSync(diffHtmlReportPath)).toBe(true); // Verifica o relatório de HTML
});
