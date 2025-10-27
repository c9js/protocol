/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const crypto = require('crypto');
const PACKET = require('../../../constants/packet-structure'); // Структура полей пакетов

/*┌─────────────────────────────┐
  │ Импортируем список констант │
  └─────────────────────────────┘*/
const {
    MAX_UINT16, // Выход за пределы двух байт в UInt16BE (65535 + 1)
} = require('../../../constants/constants');

/*┌───────────────────────────────────┐
  │ Извлекаем структуру полей пакетов │
  └───────────────────────────────────┘*/
const {
// Категория пакетов синхронизации
      LENGTH, // Длина фрагмента
    FRAGMENT, // Фрагмент
} = PACKET;

/*▄────────────────────────────────────────▄
  █                                        █
  █  Создает логику кодирования сообщений  █
  █                                        █
  ▀────────────────────────────────────────▀*/
module.exports = class EncoderMessage {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌────────────────────────────────────────────┐
  │ Возвращает буфер длины фрагмента (2 байта) │
  └────────────────────────────────────────────┘*/
    getLengthBuffer = (start, encryptedSize) => {
    // Получаем размер фрагмента (1472 байта)
        const fragmentSize = FRAGMENT.SIZE;
        
    // Создаем буфер длины фрагмента (2 байта)
        const lengthBuffer = Buffer.allocUnsafe(LENGTH.SIZE);
        
    // Сохраняем длину только для последнего фрагмента
        if (start >= encryptedSize - fragmentSize) {
            lengthBuffer.writeUInt16BE(encryptedSize - start, 0);
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
    
/*┌───────────────────────────────────────────┐
  │ Возвращает буфер фрагмента (до 1472 байт) │
  └───────────────────────────────────────────┘*/
    getFragmentBuffer = (start, encryptedBuffer) => {
        return encryptedBuffer.subarray(start, start + FRAGMENT.SIZE);
    }
    
/*┌───────────────────────────────┐
  │ Создает пакет передачи данных │
  └───────────────────────────────┘*/
    createDataPacket = (start, encryptedBuffer) => {
    // Получаем буфер длины фрагмента (2 байта)
        const lengthBuffer = this.getLengthBuffer(start, encryptedBuffer.length);
        
    // Получаем буфер фрагмента (до 1472 байт)
        const fragmentBuffer = this.getFragmentBuffer(start, encryptedBuffer);
        
    // Создаем пакет передачи данных
        const dataPacket = {
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
    encodeMessage = (messageBuffer) => {
    // Получаем зашифрованный буфер исходного сообщения
        const encryptedBuffer = this.protocol.crypto.encrypt(messageBuffer);
        
    // Создаем список пакетов передачи данных
        const dataPackets = this.createDataPackets(encryptedBuffer);
        
    // Возвращаем список пакетов передачи данных
        return dataPackets;
    }
};
