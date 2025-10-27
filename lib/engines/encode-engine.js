/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const crypto = require('crypto');
const Engine = require('../engine'); // Базовый класс для всех движков

/*┌─────────────────────────────┐
  │ Импортируем список констант │
  └─────────────────────────────┘*/
const {
    MAX_UINT16, // Выход за пределы двух байт в UInt16BE (65536)
} = require('../constants/constants');

/*┌────────────────────────────────────┐
  │ Импортируем структуру полей пакета │
  └────────────────────────────────────┘*/
const {
      LENGTH, // Длина фрагмента
    FRAGMENT, // Фрагмент
      PACKET, // Весь пакет
} = require('../constants/packet-structure');

/*┌─────────────────────────────────┐
  │ Импортируем списки полей пакета │
  └─────────────────────────────────┘*/
const {
    SEND_FIELDS, // Список полей пакета для следующей отправки
} = require('../constants/packet-fields');

/*▄──────────────────────────────▄
  █                              █
  █  Создает движок кодирования  █
  █                              █
  ▀──────────────────────────────▀*/
module.exports = class EncodeEngine extends Engine {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(protocol) {
    // Сохраняем ссылку на основной протокол и сохраняем буфер главного ключа
        super(protocol);
        
    // Создаем очередь для отправки пакетов
        this.pending = [];
    }
    
/*┌──────────────────────────────────────────────────┐
  │ Добавляет новое сообщение в очередь для отправки │
  └──────────────────────────────────────────────────┘*/
    addMessage = (message) => {
    // Создаем буфер исходного сообщения
        const messageBuffer = Buffer.from(message);
        
    // Получаем зашифрованный буфер исходного сообщения
        const encryptedBuffer = this.protocol.getEncryptedBuffer(messageBuffer);
        
    // Создаем список исходных пакетов
        const packets = this.createPackets(encryptedBuffer);
        
    // Добавляем список исходных пакетов в очередь для отправки
        this.pending.push(...packets);
        
    // Запускаем процесс обработки очереди пакетов для отправки
        this.processPending();
    }
    
/*┌──────────────────────────────────────────────────────────┐
  │ Запускает процесс обработки очереди пакетов для отправки │
  └──────────────────────────────────────────────────────────┘*/
    processPending = () => {
    // Получаем исходный пакета для следующей отправки
        const [packet] = this.pending;
        
    // В очереди нет пакетов
        if (!packet) {
            return;
        }
        
    // Получаем буфер пакета для следующей отправки
        const packetBuffer = this.getPacketBuffer(packet);
        
    // Выводим в консоль
        _=packet
        // _=packetBuffer
    }
    
/*┌────────────────────────────────────────────────┐
  │ Возвращает буфер пакета для следующей отправки │
  └────────────────────────────────────────────────┘*/
    getPacketBuffer = (packet) => {
    // Создаем случайный буфер пакета (1508 байт)
        const packetBuffer = crypto.randomBytes(PACKET.SIZE);
        
    // Добавляем ID-пакета
        packet.PACKETID = this.protocol.packetIdBuffer;
        
    // Проходим по списку полей пакета для следующей отправки
        SEND_FIELDS.forEach(([field, { OFFSET, SIZE }]) => {
        // Переставляем байты по списку позиций
            for (let i = 0; i < SIZE; i++) {
                packetBuffer[this.protocol.getPosition(OFFSET + i)] = packet[field][i];
            }
        });
        
    // Обновляем состояние синхронизации для следующего пакета
        // this.protocol.syncState(packet.HASH);
        
    // Возвращаем буфер пакета для следующей отправки
        return packetBuffer;
    }
    
/*┌─────────────────────────────────┐
  │ Создает список исходных пакетов │
  └─────────────────────────────────┘*/
    createPackets = (encryptedBuffer) => {
    // Создаем список исходных пакетов
        const packets = [];
        
    // Разбиваем зашифрованный буфер на фрагменты по 1472 байт
        for (let start = 0; start < encryptedBuffer.length; start += FRAGMENT.SIZE) {
        // Создаем исходный пакет
            const packet = this.createPacket(start, encryptedBuffer);
            
        // Добавляем исходный пакет в список исходных пакетов
            packets.push(packet);
        }
        
    // Возвращаем список исходных пакетов
        return packets;
    }
    
/*┌────────────────────────┐
  │ Создает исходный пакет │
  └────────────────────────┘*/
    createPacket = (start, encryptedBuffer) => {
    // Получаем буфер фрагмента (до 1472 байт)
        const fragmentBuffer = this.getFragmentBuffer(start, encryptedBuffer);
        
    // Получаем буфер длины фрагмента (2 байта)
        const lengthBuffer = this.getLengthBuffer(start, encryptedBuffer.length);
        
    // Получаем буфер хэш-суммы (17 байт)
        const hashBuffer = this.protocol.getHashBuffer(lengthBuffer, fragmentBuffer);
        
    // Создаем исходный пакет
        const packet = {
                HASH:     hashBuffer, // Хэш-сумма
              LENGTH:   lengthBuffer, // Длина фрагмента
            FRAGMENT: fragmentBuffer, // Фрагмент
        };
        
    // Возвращаем исходный пакет
        return packet;
    }
    
/*┌────────────────────────────┐
  │ Возвращает буфер фрагмента │
  └────────────────────────────┘*/
    getFragmentBuffer = (start, encryptedBuffer) => {
        return encryptedBuffer.slice(start, start + FRAGMENT.SIZE);
    }
    
/*┌──────────────────────────────────┐
  │ Возвращает буфер длины фрагмента │
  └──────────────────────────────────┘*/
    getLengthBuffer = (start, encryptedSize) => {
    // Определяем размер фрагмента (1472 байта)
        const fragmentSize = FRAGMENT.SIZE;
        
    // Создаем буфер длины фрагмента (2 байта)
        const lengthBuffer = Buffer.alloc(LENGTH.SIZE);
        
    // Сохраняем длину только для последнего фрагмента
        if (start >= encryptedSize - fragmentSize) {
            lengthBuffer.writeUInt16BE(encryptedSize - start);
        }
        
    // Генерируем случайную длину для всех фрагментов, кроме последнего
        else {
        // От FRAGMENT.SIZE + 1 до 65536 (включительно)
            const randomLength = crypto.randomInt(MAX_UINT16 - fragmentSize) + fragmentSize + 1;
            
        // Если выпадает 65536, то переводим в 0
            lengthBuffer.writeUInt16BE(randomLength % MAX_UINT16);
        }
        
    // Возвращаем буфер длины фрагмента
        return lengthBuffer;
    }
};
