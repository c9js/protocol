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
const Protocol = require('..'); // Протокол передачи сообщений

/*┌────────────────────────┐
  │ Создаем новый протокол │
  └────────────────────────┘*/
const protocol = new Protocol({
// Главный ключ (строка)
    masterKey:  '1234',
    
// Формат сообщения (string | buffer)
    messageFormat: 'buffer',
    
// Канал связи
    channel: {
         name: 'l2raw', // Имя канала связи
        iface:  'eth0', // Имя сетевого интерфейса
         scan:   false, // Получение пакетов без задержки (false = выкл.)
    },
});

/*┌──────────────────────────────────┐
  │ Обработчик готовности соединения │
  └──────────────────────────────────┘*/
protocol.on('ready', () => {
    _='Соединение готово, старая очередь сообщений очищена!'
    for (let i = 1; i <= 10; i++) {
    // Добавляем новое сообщение в очередь для отправки
        // protocol.sendMessage(`Hello world #${i}!`);
        protocol.sendMessage(Buffer.from('33aaff', 'hex'));
    }
});

protocol.on('message', (buffer) => {
    console.log('Получено от второй стороны:', buffer.toString('hex'));
});

protocol.on('delivered', (buffer) => {
    console.log('Доставлено второй стороне:', buffer.toString('hex'));
});

/*┌────────────────────────────────┐
  │ Обработчик получения сообщений │
  └────────────────────────────────┘*/
protocol.on('message', (message) => {
    // _=`Получено от второй стороны: ${message}`
});

/*┌───────────────────────────────┐
  │ Обработчик доставки сообщений │
  └───────────────────────────────┘*/
protocol.on('delivered', (message) => {
    // _=`Доставлено второй стороне: ${message}`
});

/*┌──────────────────────────────┐
  │ Обработчик получения пакетов │
  └──────────────────────────────┘*/
protocol.on('data', (packet, packetBuffer) => {
    const hex = packetBuffer.toString('hex').slice(0, 4);
    // _=`${packetType} | ${hex}`
    // if (process.env.F) {
        $.log(`${packet.packetType} | ${hex}`);
    // }
});
