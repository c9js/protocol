/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const crypto = require('crypto');
const { Sender } = require('l2raw'); // Передатчик
const Engine = require('../engine'); // Базовый класс для всех движков
const PACKET = require('../constants/packet-structure'); // Структура полей пакетов

/*┌──────────────────────────────────┐
  │ Импортируем списки полей пакетов │
  └──────────────────────────────────┘*/
const {
    SEND_FIELDS, // Списки полей пакетов отправки
} = require('../constants/packet-fields');

/*┌───────────────────────────────────┐
  │ Извлекаем структуру полей пакетов │
  └───────────────────────────────────┘*/
const {
    HASH, // Хэш-сумма
} = PACKET;

/*▄───────────────────────────────────▄
  █                                   █
  █  Создает движок отправки пакетов  █
  █                                   █
  ▀───────────────────────────────────▀*/
module.exports = class SenderEngine extends Engine {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(protocol) {
    // Сохраняем буфер главного ключа и ссылку на основной протокол
        super(protocol);
        
    // Очищаем очередь для отправки
        this.clearPending();
        
    // Создаем передатчик
        this.sender = new Sender({
            iface: this.protocol.options.iface, // Имя сетевого интерфейса
        });
    }
    
/*┌──────────────────────────────────────────────────┐
  │ Добавляет новое сообщение в очередь для отправки │
  └──────────────────────────────────────────────────┘*/
    send = (message) => {
    // Создаем буфер исходного сообщения
        const messageBuffer = Buffer.from(message);
        
    // Кодируем буфер исходного сообщения в список пакетов передачи данных
        const dataPackets = this.protocol.encode(messageBuffer);
        
    // Добавляем новое сообщение в очередь для отправки
        this.pending.push({
            dataPackets: dataPackets, // Список пакетов передачи данных
                message:     message, // Исходное сообщение
        });
    }
    
/*┌──────────────────────────────┐
  │ Очищает очередь для отправки │
  └──────────────────────────────┘*/
    clearPending = () => {
        this.pending = [];
    }
    
/*┌──────────────────────────────────────────────────────┐
  │ Извлекает следующий пакет передачи данных из очереди │
  └──────────────────────────────────────────────────────┘*/
    extractNextPacket = () => {
    // Получаем первое сообщение из очереди
        const firstMessage = this.pending[0];
        
    // Получаем список пакетов передачи данных
        const dataPackets = firstMessage.dataPackets;
        
    // Извлекаем следующий пакет передачи данных
        const nextPacket = dataPackets.find(dataPacket => !dataPacket.sent);
        
    // Сохраняем инфориацию об отправлении пакета
        nextPacket.sent = true;
        
    // Возвращаем следующий пакет передачи данных
        return nextPacket;
    }
    
/*┌─────────────────────┐
  │ Создает новый пакет │
  └─────────────────────┘*/
    createPacket = (type, fields) => {
    // Создаем новый пакет
        const packet = {};
        
    // Добавляем список полей
        SEND_FIELDS[type].forEach(({ field }) => {
            packet[field] = fields[field];
        });
        
    // Добавляем тип пакета
        packet.type = type;
        
    // Добавляем ID-пакета
        packet.PACKETID = this.protocol.getPacketIdBuffer(type);
        
    // Возвращаем новый пакет
        return packet;
    }
    
/*┌─────────────────────────────┐
  │ Создает пакет инициализации │
  └─────────────────────────────┘*/
    createInitPacket = () => {
    // Создаем случайный буфер хэш-суммы (17 байт)
        const hashBuffer = crypto.randomBytes(HASH.SIZE);
        
    // Получаем буфер ID-ноды (32 байта)
        const nodeIdBuffer = this.protocol.getNodeIdBuffer();
        
    // Создаем пакет инициализации
        const initPacket = this.createPacket('INIT', {
              HASH:   hashBuffer, // Хэш-сумма
            NODEID: nodeIdBuffer, // ID-ноды
        });
        
    // Возвращаем пакет инициализации
        return initPacket;
    }
    
/*┌───────────────────────────────┐
  │ Создает пакет передачи данных │
  └───────────────────────────────┘*/
    createDataPacket = () => {
    // Извлекаем следующий пакет передачи данных из очереди
        const nextPacket = this.extractNextPacket();
        
    // Создаем пакет передачи данных
        const dataPacket = this.createPacket('DATA', {
            ...nextPacket, // Добавляем список полей
        });
        
    // Возвращаем пакет передачи данных
        return dataPacket;
    }
    
/*┌────────────────────┐
  │ Создает пинг-пакет │
  └────────────────────┘*/
    createPingPacket = () => {
    // Создаем случайный буфер хэш-суммы (17 байт)
        const hashBuffer = crypto.randomBytes(HASH.SIZE);
        
    // Создаем пинг-пакет
        const pingPacket = this.createPacket('PING', {
            HASH: hashBuffer, // Хэш-сумма
        });
        
    // Возвращаем пинг-пакет
        return pingPacket;
    }
    
/*┌────────────────────────┐
  │ Создает пакет отправки │
  └────────────────────────┘*/
    createSendPacket = (type) => {
    // Создаем пакет инициализации
        if (type == 'INIT') {
            return this.createInitPacket();
        }
        
    // Создаем пакет передачи данных
        if (this.pending.length > 0) {
            return this.createDataPacket();
        }
        
    // Создаем пинг-пакет
        return this.createPingPacket();
    }
    
/*┌───────────────────────────────┐
  │ Создает буфер пакета отправки │
  └───────────────────────────────┘*/
    createSendPacketBuffer = (sendPacket) => {
    // Создаем случайный буфер пакета отправки (1508 байт)
        const packetBuffer = crypto.randomBytes(PACKET.SIZE);
        
    // Получаем тип пакета
        const type = sendPacket.type;
        
    // Проходим по списку полей пакета отправки
        SEND_FIELDS[type].forEach(({ field, offset }) => {
        // Переставляем байты по списку позиций
            for (let i = 0; i < sendPacket[field].length; i++) {
            // Получаем текущую позицию байта
                const position = this.protocol.getBytePosition(type, i, offset);
                
            // Переставляем текущий байт
                packetBuffer[position] = sendPacket[field][i];
            }
        });
        
    // Возвращаем буфер пакета отправки
        return packetBuffer;
    }
    
/*┌──────────────────────────────┐
  │ Проверяет отправку сообщения │
  └──────────────────────────────┘*/
    checkMessageSent = () => {
    // В очереди нет сообщений
        if (this.pending.length == 0) return false;
        
    // Получаем первое сообщение из очереди
        const firstMessage = this.pending[0];
        
    // Получаем список пакетов передачи данных
        const dataPackets = firstMessage.dataPackets;
        
    // Проверяем отправку сообщения
        return dataPackets.every(dataPacket => dataPacket.sent);
    }
    
/*┌───────────────────────────────────────────────────────────────┐
  │ Завершает процесс доставки последнего отправленного сообщения │
  └───────────────────────────────────────────────────────────────┘*/
    completeMessageDelivery = () => {
    // В очереди нет отправленных сообщений
        if (!this.checkMessageSent()) return;
        
    // Извлекаем отправленное сообщение из очереди
        const sentMessage = this.pending.shift();
        
    // Сообщаем о доставке сообщения
        this.protocol.emit('delivered', sentMessage.message);
    }
    
/*┌───────────────────────────────────────────┐
  │ Запускает следующий цикл отправки пакетов │
  └───────────────────────────────────────────┘*/
    runSendCycle = (type) => {
    // Завершаем процесс доставки последнего отправленного сообщения
        this.completeMessageDelivery();
        
    // Создаем пакет отправки
        const sendPacket = this.createSendPacket(type);
        
    // Создаем буфер пакета отправки
        const sendPacketBuffer = this.createSendPacketBuffer(sendPacket);
        
    // Обновляем состояние синхронизации для следующего пакета
        this.protocol.syncState(sendPacket.HASH);
        
    // Обновляем пакет для следующей отправки
        this.sender.update(sendPacketBuffer);
    }
};
