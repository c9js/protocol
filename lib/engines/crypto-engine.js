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
    IV_SIZE, // Размер вектора инициализации (16 байт)
} = require('../constants/constants');

/*▄─────────────────────────────▄
  █                             █
  █  Создает движок шифрования  █
  █                             █
  ▀─────────────────────────────▀*/
module.exports = class CryptoEngine extends Engine {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(protocol) {
    // Сохраняем ссылку на основной протокол и сохраняем буфер главного ключа
        super(protocol);
    }
    
/*┌────────────────────────────────────────────────────┐
  │ Возвращает зашифрованный буфер исходного сообщения │
  └────────────────────────────────────────────────────┘*/
    encrypt = (messageBuffer) => {
    // Создаем случайный буфер вектора инициализации (16 байт)
        const ivBuffer = crypto.randomBytes(IV_SIZE);
        
    // Создаем потоковый шифратор с использованием главного ключа и вектора инициализации
        const cipher = crypto.createCipheriv(
                   'aes-256-cbc', // Алгоритм шифрования
            this.masterKeyBuffer, // Буфер главного ключа (32 байта)
                        ivBuffer, // Буфер вектора инициализации (16 байт)
        );
        
    // Создаем зашифрованный буфер исходного сообщения
        const encryptedContentBuffer = Buffer.concat([
            cipher.update(messageBuffer), // Добавляем основную часть
            cipher.final(),               // Добавляем финальный блок + паддинг
        ]);
        
    // Объединяем буфер вектора инициализации и зашифрованный буфер исходного сообщения
        const encryptedBuffer = Buffer.concat([ivBuffer, encryptedContentBuffer]);
        
    // Возвращаем зашифрованный буфер
        return encryptedBuffer;
    }
    
/*┌─────────────────────────────────────────────────────┐
  │ Возвращает расшифрованный буфер исходного сообщения │
  └─────────────────────────────────────────────────────┘*/
    decrypt = (encryptedBuffer) => {
    // Извлекаем буфер вектора инициализации (первые 16 байт)
        const ivBuffer = encryptedBuffer.slice(0, IV_SIZE);
        
    // Извлекаем зашифрованный буфер исходного сообщения
        const encryptedContentBuffer = encryptedBuffer.slice(IV_SIZE);
        
    // Создаем потоковый дешифратор с использованием главного ключа и вектора инициализации
        const decipher = crypto.createDecipheriv(
                   'aes-256-cbc', // Алгоритм шифрования
            this.masterKeyBuffer, // Буфер главного ключа (32 байта)
                        ivBuffer, // Буфер вектора инициализации (16 байт)
        );
        
    // Создаем расшифрованный буфер исходного сообщения
        const messageBuffer = Buffer.concat([
            decipher.update(encryptedContentBuffer), // Добавляем основную часть
            decipher.final(),                        // Добавляем финальный блок и удаляем паддинг
        ]);
        
    // Возвращаем расшифрованный буфер исходного сообщения
        return messageBuffer;
        
    // Получаем расшифрованный буфер исходного сообщения
        // _=this.protocol.getDecryptedBuffer(encryptedBuffer).toString();
    }
};
