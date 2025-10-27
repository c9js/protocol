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
} = require('../constants/packet-structure');

/*▄──────────────────────────────▄
  █                              █
  █  Создает движок кодирования  █
  █                              █
  ▀──────────────────────────────▀*/
module.exports = class EncoderEngine extends Engine {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(protocol) {
    // Сохраняем буфер главного ключа и ссылку на основной протокол
        super(protocol);
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
    
/*┌───────────────────────────────┐
  │ Создает пакет передачи данных │
  └───────────────────────────────┘*/
    createDataPacket = (start, encryptedBuffer) => {
    // Получаем буфер фрагмента (до 1472 байт)
        const fragmentBuffer = this.getFragmentBuffer(start, encryptedBuffer);
        
    // Получаем буфер длины фрагмента (2 байта)
        const lengthBuffer = this.getLengthBuffer(start, encryptedBuffer.length);
        
    // Получаем буфер хэш-суммы (17 байт)
        const hashBuffer = this.protocol.getHashBuffer(lengthBuffer, fragmentBuffer);
        
    // Создаем пакет передачи данных
        const dataPacket = {
                HASH:     hashBuffer, // Хэш-сумма
              LENGTH:   lengthBuffer, // Длина фрагмента
            FRAGMENT: fragmentBuffer, // Фрагмент
        };
        
    // Возвращаем пакет передачи данных
        return dataPacket;
    }
    
/*┌────────────────────────────────────────┐
  │ Создает список пакетов передачи данных │
  └────────────────────────────────────────┘*/
    createDataPackets = (encryptedBuffer) => {
    // Создаем список пакетов передачи данных
        const dataPackets = [];
        
    // Разбиваем зашифрованный буфер на фрагменты по 1472 байт
        for (let start = 0; start < encryptedBuffer.length; start += FRAGMENT.SIZE) {
        // Создаем пакет передачи данных
            const dataPacket = this.createDataPacket(start, encryptedBuffer);
            
        // Добавляем пакет передачи данных в список
            dataPackets.push(dataPacket);
        }
        
    // Возвращаем список пакетов передачи данных
        return dataPackets;
    }
    
/*┌─────────────────────────────────────────────────────────────────────┐
  │ Кодирует буфер исходного сообщения в список пакетов передачи данных │
  └─────────────────────────────────────────────────────────────────────┘*/
    encode = (messageBuffer) => {
    // Получаем зашифрованный буфер исходного сообщения
        const encryptedBuffer = this.protocol.getEncryptedBuffer(messageBuffer);
        
    // Создаем список пакетов передачи данных
        const dataPackets = this.createDataPackets(encryptedBuffer);
        
    // Возвращаем список пакетов передачи данных
        return dataPackets;
    }
};
