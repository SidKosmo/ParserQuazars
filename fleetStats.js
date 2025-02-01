const fs = require('fs');

function parseFleetStats(messages) {
    let shipCounts = {};

    messages.forEach(msg => {
        if (msg.text.includes("Вы нашли б/у флот")) {
            const lines = msg.text.split("\n");
            const shipLineIndex = lines.findIndex(line => line.includes("Найдены корабли:"));

            if (shipLineIndex !== -1) {
                for (let i = shipLineIndex + 1; i < lines.length; i++) {
                    const match = lines[i].match(/(.+?)\s+×\s+(\d+)/);
                    if (match) {
                        let shipName = match[1].trim();
                        let shipCount = parseInt(match[2], 10);
                        shipCounts[shipName] = (shipCounts[shipName] || 0) + shipCount;
                    }
                }
            }
        }
    });

    return shipCounts;
}

// 📌 Экспортируем функцию для использования в сервере
module.exports = function getFleetStats() {
    const messages = JSON.parse(fs.readFileSync('messages.json', 'utf-8'));
    return parseFleetStats(messages);
};
