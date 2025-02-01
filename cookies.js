const fs = require('fs');
const config = require('./config');

async function loadCookies(page) {
  if (fs.existsSync(config.cookiesPath)) {
    try {
      const cookies = JSON.parse(fs.readFileSync(config.cookiesPath, 'utf-8'));
      await page.setCookie(...cookies);
      console.log("✅ Загружены куки.");
    } catch (error) {
      console.error('Ошибка при чтении файла куки:', error);
    }
  }
}

async function saveCookies(page) {
  const cookies = await page.cookies();
  fs.writeFileSync(config.cookiesPath, JSON.stringify(cookies, null, 2));
  console.log("✅ Куки сохранены.");
}

module.exports = { loadCookies, saveCookies };
