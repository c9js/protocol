// Очищаем консоль
console.clear();

/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
require('core'); // Ядро
const { Protocol } = require('..'); // Протокол передачи сообщений

// Создаем новый протокол
const protocol = new Protocol({
        iface: 'eth0', // Имя сетевого интерфейса
    masterKey: '1234', // Главный ключ (строка)
});

// Добавляем обработчик получения сообщений
protocol.on('message', (message) => {
    _=`Получено новое сообщение: ${message.length}`
    _=message
});

// Добавляем новое сообщение в очередь для отправки
protocol.addMessage('Hello world!');
