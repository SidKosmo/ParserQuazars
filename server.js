const express = require('express');
const fs = require('fs');
const { scrapeMessages, scrapeMap } = require('./scraper');
const app = express();

const PORT = 3000;
const messagesFilePath = 'messages.json';

app.use(express.static('public')); // Подключаем фронтенд

// 📌 API для получения сообщений
app.get('/api/messages', (req, res) => {
    if (fs.existsSync(messagesFilePath)) {
        const messages = JSON.parse(fs.readFileSync(messagesFilePath, 'utf-8'));
        res.json({ success: true, messages });
    } else {
        res.json({ success: false, messages: [] });
    }
});

// 📌 API для запуска сканирования
app.get('/api/scan', async (req, res) => {
    try {
        await scrapeMessages(); // Запускаем парсинг
        res.json({ success: true, message: '✅ Сканирование завершено!' });
    } catch (error) {
        console.error('Ошибка парсинга:', error);
        res.status(500).json({ success: false, message: '❌ Ошибка сканирования' });
    }
});


app.get('/api/scanMap', async (req, res) => {
    try {
        await scrapeMap(); // Запускаем парсинг
        res.json({ success: true, message: '✅ Сканирование завершено!' });
    } catch (error) {
        console.error('Ошибка парсинга:', error);
        res.status(500).json({ success: false, message: '❌ Ошибка сканирования' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер работает: http://localhost:${PORT}`);
});
