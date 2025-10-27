/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const crypto = require('crypto');
const { Sender } = require('l2raw'); // Передатчик
const Engine = require('../engine'); // Базовый класс для всех движков

/*┌────────────────────────────────────┐
  │ Импортируем структуру полей пакета │
  └────────────────────────────────────┘*/
const {
      HASH, // Хэш-сумма
    PACKET, // Весь пакет
} = require('../constants/packet-structure');

/*┌─────────────────────────────────┐
  │ Импортируем списки полей пакета │
  └─────────────────────────────────┘*/
const {
    SEND_FIELDS, // Списки полей пакетов отправки
} = require('../constants/packet-fields');

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
        
    // Создаем очередь для отправки
        this.pending = [];
        
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
        SEND_FIELDS[type].forEach(([field]) => {
            packet[field] = fields[field];
        });
        
    // Добавляем тип пакета
        packet.type = type;
        
    // Пакет синхронизации
        if (type == 'SYNC') {
        // Добавляем ID-пакета
            packet.PACKETID = this.protocol.syncPacketIdBuffer;
        }
        
    // Пинг-пакет
        if (type == 'PING') {
        // Добавляем ID-пакета
            packet.PACKETID = this.protocol.pingPacketIdBuffer;
        }
        
    // Пакет передачи данных
        if (type == 'DATA') {
        // Добавляем ID-пакета
            packet.PACKETID = this.protocol.dataPacketIdBuffer;
        }
        
    // Возвращаем новый пакет
        return packet;
    }
    
/*┌────────────────────┐
  │ Создает пинг-пакет │
  └────────────────────┘*/
    createPingPacket = () => {
    // Получаем случайный буфер хэш-суммы (17 байт)
        const hashBuffer = crypto.randomBytes(HASH.SIZE);
        
    // Создаем пинг-пакет
        const pingPacket = this.createPacket('PING', {
            HASH: hashBuffer, // Хэш-сумма
        });
        
    // Возвращаем пинг-пакет
        return pingPacket;
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
    
/*┌────────────────────────┐
  │ Создает пакет отправки │
  └────────────────────────┘*/
    createSendPacket = () => {
    // Создаем пакет отправки
        let sendPacket;
        
    // Проверяем очередь для отправки
        if (this.pending.length > 0) {
        // Создаем пакет передачи данных
            const dataPacket = this.createDataPacket();
            
        // Добавляем список полей пакета передачи данных в пакет отправки
            sendPacket = { ...dataPacket };
            
        // Возвращаем пакет отправки
            return sendPacket;
        }
        
    // Создаем пинг-пакет
        const pingPacket = this.createPingPacket();
        
    // Добавляем список полей пинг-пакет в пакет отправки
        sendPacket = { ...pingPacket };
        
    // Возвращаем пакет отправки
        return sendPacket;
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
        SEND_FIELDS[type].forEach(([field, { OFFSET }]) => {
        // Переставляем байты по списку позиций
            for (let i = 0; i < sendPacket[field].length; i++) {
                packetBuffer[this.protocol.getPosition(type, i, OFFSET)] = sendPacket[field][i];
            }
        });
        
    // Возвращаем буфер пакета отправки
        return packetBuffer;
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
    runSendCycle = () => {
    // Завершаем процесс доставки последнего отправленного сообщения
        this.completeMessageDelivery();
        
    // Создаем пакет отправки
        const sendPacket = this.createSendPacket();
        
    // Создаем буфер пакета отправки
        const sendPacketBuffer = this.createSendPacketBuffer(sendPacket);
        
    // Обновляем состояние синхронизации для следующего пакета
        this.protocol.syncState(sendPacket.HASH);
        
    // Обновляем пакет для следующей отправки
        this.sender.update(sendPacketBuffer);
    }
};
