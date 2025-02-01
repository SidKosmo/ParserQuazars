async function loadMessages() {
    const response = await fetch('/api/messages');
    const data = await response.json();
    
    if (data.success) {
        const table = document.getElementById('messagesTable');
        table.innerHTML = ''; // Очищаем

        data.messages.forEach(msg => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${msg.messageId}</td>
                <td>${msg.text}</td>
                <td>${msg.time}</td>
            `;
            table.appendChild(row);
        });
    }
}

async function scanMessages() {
    document.getElementById('status').innerText = '⏳ Сканирование запущено...';
    
    const response = await fetch('/api/scan');
    const data = await response.json();

    document.getElementById('status').innerText = data.message;
    if (data.success) {
        loadMessages();
    }
}

// Загружаем сообщения при открытии страницы
window.onload = loadMessages;
