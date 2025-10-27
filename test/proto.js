// Очищаем консоль
console.clear();

/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
require('core'); // Ядро
const { performance } = require('node:perf_hooks');
$.log = (log) => {
    let time = Math.round(performance.now() - $._start);
    $._start=performance.now();
    _=`${time} | ${log}`;
};
const { Protocol } = require('..'); // Протокол передачи сообщений

// Создаем новый протокол
const protocol = new Protocol({
        iface: 'eth0', // Имя сетевого интерфейса
    masterKey: '1234', // Главный ключ (строка)
});

// Добавляем обработчик получения сообщений
protocol.on('message', (message) => {
    _=`Получено новое сообщение: ${message}`
});

// Добавляем обработчик доставки сообщений
protocol.on('delivered', (message) => {
    _=`Сообщение доставленно: ${message}`
});

// Добавляем обработчик получения пакетов
protocol.on('data', (packetType, packetBuffer) => {
    const hex = packetBuffer.toString('hex').slice(0, 4);
    _=`${packetType} | ${hex}`
});

// Добавляем новое сообщение в очередь для отправки
    if (!process.env.F) {
    // Добавляем новое сообщение в очередь для отправки
        setTimeout(() => {
            for (let i = 1; i <= 10; i++) {
                protocol.send(`Hello world #${i}!`);
            }
        }, 1000);
    }
    