const puppeteer = require('puppeteer');
const fs = require('fs');

const cookiesPath = 'cookies.json';
const messagesFilePath = 'messages.json';

async function scrapeMessages(retries = 3) {
    console.log("🔄 Запуск сканирования...");

    let browser;
    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        // 📌 Загружаем куки (если есть)
        if (fs.existsSync(cookiesPath)) {
            try {
                const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
                await page.setCookie(...cookies);
                console.log("✅ Куки загружены!");
            } catch (error) {
                console.error("⚠ Ошибка загрузки куков:", error);
            }
        }

        // 📌 Переход на страницу сообщений
        await page.goto('https://quasars.online/messages.php?mode=show&message_class=15', { waitUntil: 'load', timeout: 60000 });

        // 📌 Проверяем, залогинен ли пользователь
        const loginForm = await page.$('input[name="username"]');
        if (loginForm) {
            console.log("⚠ Необходим повторный вход в аккаунт!");
            await login(page);
        }

        // 📌 Ждем загрузки сообщений
        await page.waitForSelector('tr[id^="mess"]');

        let allMessages = [];

        // 📌 Определяем кол-во страниц
        const maxPage = await page.evaluate(() => {
            const lastPageLink = document.querySelector('a.link.first-last');
            const url = lastPageLink ? lastPageLink.href : '';
            const matches = url.match(/sheet=(\d+)/);
            return matches ? parseInt(matches[1], 10) : 1;
        });

        console.log(`📄 Всего страниц: ${maxPage}`);

        for (let pageNumber = 1; pageNumber <= maxPage; pageNumber++) {
            console.log(`🔍 Обрабатываем страницу ${pageNumber}`);

            await page.goto(`https://quasars.online/messages.php?mode=show&message_class=15&sheet=${pageNumber}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await page.waitForSelector('tr[id^="mess"]');

            // 📌 Извлекаем данные
            const messages = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('tr[id^="mess"]'));
                return rows.map(row => {
                    const messageId = row.id;
                    const messageText = row.querySelector('td.mnl_expedition.c_l')?.innerText.trim() || "Нет текста";
                    const time = row.previousElementSibling?.querySelector('td.subheader:nth-child(2)')?.innerText.trim() || "Не найдено";

                    return { messageId, text: messageText, time };
                });
            });

            allMessages = allMessages.concat(messages);
        }

        fs.writeFileSync(messagesFilePath, JSON.stringify(allMessages, null, 2));
        console.log("✅ Сохранено сообщений:", allMessages.length);

        await browser.close();
        return { success: true, message: "✅ Сканирование завершено!" };

    } catch (error) {
        console.error("❌ Ошибка при парсинге:", error);

        if (browser) {
            await browser.close();
        }

        if (retries > 0) {
            console.log(`🔁 Повторная попытка... Осталось: ${retries}`);
            return await scrapeMessages(retries - 1);
        }

        return { success: false, message: "❌ Ошибка парсинга после нескольких попыток!" };
    }
}

// 📌 Функция входа в аккаунт
async function login(page) {
    await page.goto('https://quasars.online/login.php', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('input[name="username"]', { visible: true });
    await page.type('input[name="username"]', '***@mail.ru'); 
    await page.type('input[name="password"]', '**************'); 

    await page.waitForSelector('input[name="login"]', { visible: true });
    await page.click('input[name="login"]');

    // 📌 Ждем редиректа на главную страницу
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("✅ Успешный вход!");

    // 📌 Сохраняем новые куки
    const cookies = await page.cookies();
    fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
    console.log("✅ Куки обновлены!");

    // 📌 После логина переходим к сообщениям
    await page.goto('https://quasars.online/messages.php?mode=show&message_class=15', { waitUntil: 'domcontentloaded' });
    console.log("📩 Перешли на страницу сообщений");
}

async function scrapeMap(){
    console.log("🔄 Запуск сканирования...");

    let browser;
    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        // 📌 Загружаем куки (если есть)
        if (fs.existsSync(cookiesPath)) {
            try {
                const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
                await page.setCookie(...cookies);
                console.log("✅ Куки загружены!");
            } catch (error) {
                console.error("⚠ Ошибка загрузки куков:", error);
            }
        }
        await page.goto('https://quasars.online/galaxy.php?mode=0', { waitUntil: 'load', timeout: 60000 });

        // 📌 Проверяем, залогинен ли пользователь
        const loginForm = await page.$('input[name="username"]');
        if (loginForm) {
            console.log("⚠ Необходим повторный вход в аккаунт!");
            await login(page);
        }


        await page.waitForSelector('input [name="galaxy"]');
        await page.type('input[name="galaxy"]', '1');
        await page.type('input[name="system"]', '1'); 
        await page.waitForSelector('input[value="Перейти"]', { visible: true });
        await page.click('input[value="Перейти"]'); 
        await browser.close();
        return { success: true, message: "✅ Сканирование Вселенной завершено!" };


    }catch (error) {
            console.error("❌ Ошибка при парсинге Вселенной:", error);
    
            if (browser) {
                await browser.close();
            }
    
            if (retries > 0) {
                console.log(`🔁 Повторная попытка... Осталось: ${retries}`);
                return await scrapeMessages(retries - 1);
            }
    
            return { success: false, message: "❌ Ошибка парсинга Вселенной после нескольких попыток!" };
    
        }
}
module.exports = {
    scrapeMessages,
    scrapeMap,
};