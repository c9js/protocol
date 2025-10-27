/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const crypto = require('crypto');
const PACKET = require('../../../constants/packet-structure'); // Структура полей пакетов

/*┌──────────────────────────────────┐
  │ Импортируем списки полей пакетов │
  └──────────────────────────────────┘*/
const {
        ID_FIELDS, // Списки полей идентификации
    PACKET_FIELDS, // Списки полей пакетов отправки
     FINAL_FIELDS, // Список полей буфера отправки
} = require('../../../constants/packet-fields');

/*┌───────────────────────────────────┐
  │ Извлекаем структуру полей пакетов │
  └───────────────────────────────────┘*/
const {
// Финальный буфер
    PAYLOAD, // Полезная нагрузка
} = PACKET;

/*▄──────────────────────────────────────▄
  █                                      █
  █  Создает логику кодирования пакетов  █
  █                                      █
  ▀──────────────────────────────────────▀*/
module.exports = class EncoderPacket {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌─────────────────────────────────┐
  │ Шифрует буфер полезной нагрузки │
  └─────────────────────────────────┘*/
    encryptedPayload = (category, payloadBuffer, offset) => {
    // Категория пакетов авторизации
        if (category == 'AUTH') {
        // Извлекаем заполненную часть буфера полезной нагрузки
            const filledPayloadBuffer = payloadBuffer.subarray(0, offset);
            
        // Получаем зашифрованный буфер заполненной части полезной нагрузки
            const encryptedBuffer = this.protocol.crypto.encrypt(filledPayloadBuffer);
            
        // Добавляем зашифрованный буфер заполненной части полезной нагрузки
            payloadBuffer.set(encryptedBuffer);
            
        // Обновляем смещение
            offset = encryptedBuffer.length;
        }
        
    // Добавляем случайные байты в незаполненную часть полезной нагрузки
        if (offset < payloadBuffer.length) {
            crypto.randomFillSync(payloadBuffer.subarray(offset));
        }
    }
    
/*┌───────────────────────────────────────────────────┐
  │ Кодирует исходный пакет в буфер полезной нагрузки │
  └───────────────────────────────────────────────────┘*/
    encodePayload = (packet, category, packetType) => {
    // Создаем буфер полезной нагрузки (1491 байт)
        const payloadBuffer = Buffer.allocUnsafe(PAYLOAD.SIZE);
        
    // Инициализируем начальное смещение
        let offset = 0;
        
    // Проходим по списку полей идентификации
        ID_FIELDS[category].forEach(({ field, size }) => {
        // Добавляем поле в буфер полезной нагрузки
            payloadBuffer.set(packet[field], offset);
            
        // Обновляем смещение
            offset += size;
        });
        
    // Проходим по списку полей пакета отправки
        PACKET_FIELDS[packetType].forEach(({ field, size }) => {
        // Добавляем поле в буфер полезной нагрузки
            payloadBuffer.set(packet[field], offset);
            
        // Обновляем смещение
            offset += size;
        });
        
    // Шифруем буфер полезной нагрузки
        this.encryptedPayload(category, payloadBuffer, offset);
        
    // Возвращаем буфер полезной нагрузки
        return payloadBuffer;
    }
    
/*┌──────────────────────────────────────────┐
  │ Кодирует исходный пакет в буфер отправки │
  └──────────────────────────────────────────┘*/
    encodePacket = (packet, category) => {
    // Создаем буфер отправки (1508 байт)
        const packetBuffer = Buffer.allocUnsafe(PACKET.SIZE);
        
    // Получаем список позиций для текущей категории пакетов
        const positions = this.protocol.state.getPositions(category);
        
    // Инициализируем начальное смещение
        let offset = 0;
        
    // Проходим по списку полей буфера отправки
        FINAL_FIELDS.forEach(({ field, size }) => {
        // Переставляем байты по списку позиций
            for (let i = 0; i < size; i++) {
            // Определяем текущую позицию байта
                const position = positions[offset + i];
                
            // Переставляем текущий байт
                packetBuffer[position] = packet[field][i];
            }
            
        // Обновляем смещение
            offset += size;
        });
        
    // Возвращаем буфер отправки
        return packetBuffer;
    }
};
