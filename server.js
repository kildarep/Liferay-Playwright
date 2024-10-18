const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); 

app.post('/screenshot', (req, res) => {
    const { url } = req.body;

    // Playwright
    exec(`URL=${url} npx playwright test tests/screenshot-comparison.spec.js`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }
        console.log(stdout);
        
        const preDeployPath = '/screenshots/pre-deploy.png';
        const postDeployPath = '/screenshots/post-deploy.png';
        const diffPath = '/screenshots/diff.png';
        const diffHtmlPath = '/html/diff-report.html';

        res.json({ 
            preDeploy: preDeployPath,
            postDeploy: postDeployPath,
            diff: diffPath,
            diffHtml: diffHtmlPath
        });
    });
});

// Rota para acessar a página de comparação
app.get('/comparison', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'comparison.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
