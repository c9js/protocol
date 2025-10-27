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
    console.log(`${log} | ${Math.floor(time / 100) / 10}`);
};
const Protocol = require('..'); // Протокол передачи сообщений

/*┌─────────────────────────┐
  │ Инициализирует протокол │
  └─────────────────────────┘*/
const initProtocol = () => {
// Создаем новый протокол
    const protocol = new Protocol({
    // Выбранный язык
        lang: 'ru',
        
    // Главный ключ (строка)
        masterKey:  '1234',
        
    // Формат сообщения (string | buffer)
        messageFormat: 'string',
        
    // Канал связи
        channel: {
             name: 'l2raw', // Имя канала связи
            iface:  'eth0', // Имя сетевого интерфейса
            // scanner: { iface: 'eth2' },
            // sender: { iface: 'eth1', delayError: 30000, },
        },
    });
    
// Добавляем обработчик информационных сообщений
    protocol.on('info', (reason) => {
        logger('INFO', reason);
    });
    
// Добавляем обработчик предупреждений
    protocol.on('warn', (reason) => {
        logger('WARN', reason);
    });
    
// Добавляем обработчик ошибок
    protocol.on('error', (reason) => {
        logger('ERROR', reason);
    });
    
// Добавляем обработчик запуска приемника
    protocol.on('scanner:start', () => {
        console.log('Приемник запущен!');
    });
    
// Добавляем обработчик запуска передатчика
    protocol.on('sender:start', () => {
        console.log('Передатчик запущен!');
    });
    
// Добавляем обработчик готовности соединения
    protocol.on('ready', () => {
        console.log('Соединение готово, старая очередь сообщений очищена!');
        for (let i = 1; i <= 10; i++) {
        // Добавляем новое сообщение в очередь для отправки
            protocol.sendMessage(`Hello world #${i}!`);
        }
    });
    
// Добавляем обработчик получения сообщений
    protocol.on('message', (message) => {
        console.log(`Получено от второй стороны: ${message}`);
    });
    
// Добавляем обработчик доставки сообщений
    protocol.on('delivered', (message) => {
        console.log(`Доставлено второй стороне: ${message}`);
    });
    
// Добавляем обработчик получения пакетов
    protocol.on('data', (packet, packetBuffer) => {
        const hex = packetBuffer.toString('hex').slice(0, 4);
        // console.log(`${packetType} | ${hex}`);
        // if (process.env.F) {
            $.log(`${packet.packetType} | ${hex}`);
        // }
    });
};

/*┌───────────────────────────┐
  │ Выводит причину в консоль │
  └───────────────────────────┘*/
const logger = (role, reason) => {
    console.group(reason.code ? `${role}: ${reason.code}` : `${role}!`);
    if (reason.details) {
        reason.details.forEach((detail) => {
            console.log(detail);
        });
    }
    console.groupEnd();
    if (reason.stack) {
        console.log(reason.stack, '\n');
    }
};

/*┌─────────────────────────┐
  │ Инициализируем протокол │
  └─────────────────────────┘*/
    try {
        initProtocol();
    }
    
/*┌──────────────────────────────────┐
  │ Протокол не прошел инициализацию │
  └──────────────────────────────────┘*/
    catch (reason) {
    // Выводим причину в консоль
        logger('INIT ERROR', reason);
        // console.log(reason);
    }
