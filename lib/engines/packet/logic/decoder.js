/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const PACKET = require('../../../constants/packet-structure'); // Структура полей пакетов

/*┌──────────────────────────────────────┐
  │ Импортируем список категорий пакетов │
  └──────────────────────────────────────┘*/
const {
    CATEGORY, // Список категорий пакетов
} = require('../../../constants/packet-categories');

/*┌──────────────────────────────────┐
  │ Импортируем списки полей пакетов │
  └──────────────────────────────────┘*/
const {
        ID_FIELDS, // Списки полей идентификации
    PACKET_FIELDS, // Списки полей полученных пакетов
     FINAL_FIELDS, // Список полей полученного буфера
} = require('../../../constants/packet-fields');

/*┌───────────────────────────────────┐
  │ Извлекаем структуру полей пакетов │
  └───────────────────────────────────┘*/
const {
// Все категории пакетов
        TYPE, // Тип пакета
    
// Категория пакетов синхронизации
    FRAGMENT, // Фрагмент
} = PACKET;

/*▄────────────────────────────────────────▄
  █                                        █
  █  Создает логику декодирования пакетов  █
  █                                        █
  ▀────────────────────────────────────────▀*/
module.exports = class DecoderPacket {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌────────────────────────────┐
  │ Извлекает размер фрагмента │
  └────────────────────────────┘*/
    extractFragmentSize = (dataPacket) => {
    // Получаем длину фрагмента
        let length = dataPacket.LENGTH.readUInt16BE();
        
    // Добавляем поле последнего фрагмента
        dataPacket.isLast = true;
        
    // Это не последний фрагмент
        if (length > FRAGMENT.SIZE || length == 0) {
            length = FRAGMENT.SIZE;
            dataPacket.isLast = false;
        }
        
    // Это последний фрагмент
        return length;
    }
    
/*┌───────────────────────────┐
  │ Проверяет хэш-целостности │
  └───────────────────────────┘*/
    checkHash = (packet) => {
    // Получаем буфер полезной нагрузки (1491 байт)
        const payloadBuffer = packet.PAYLOAD;
        
    // Формируем буфер хэш-целостности (17 байт)
        const hashBuffer = this.protocol.hash.deriveHashBuffer(payloadBuffer);
        
    // Проверяем хэш-целостности
        return hashBuffer.equals(packet.HASH);
    }
    
/*┌──────────────────────┐
  │ Проверяет тип пакета │
  └──────────────────────┘*/
    checkPacketType = (packetType, payloadBuffer) => {
    // Получаем буфер типа пакета (1 байт)
        const packetTypeBuffer = this.protocol.state.getPacketTypeBuffer(packetType);
        
    // Проверяем каждый байт типа пакета
        for (let i = 0; i < TYPE.SIZE; i++) {
        // Проверяем текущую позицию байта
            if (packetTypeBuffer[i] != payloadBuffer[i]) {
                return false;
            }
        }
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌──────────────────────────────────────────────────┐
  │ Извлекаем тип пакета из буфера полезной нагрузки │
  └──────────────────────────────────────────────────┘*/
    extractPacketType = (packet, category) => {
    // Получаем буфер полезной нагрузки (1491 байт)
        const payloadBuffer = packet.PAYLOAD;
        
    // Получаем список всех типов для текущей категории пакетов
        const packetTypes = CATEGORY[category];
        
    // Проходим по каждому типу пакетов
        for (const packetType of packetTypes) {
        // Проверяем тип пакета
            if (this.checkPacketType(packetType, payloadBuffer)) {
            // Проверка прошла успешно
                return packetType;
            }
        }
        
    // Тип пакета не найден
        return false;
    }
    
/*┌────────────────────────────────────────────┐
  │ Декодирует полученный буфер в список полей │
  └────────────────────────────────────────────┘*/
    decodePacketBuffer = (packet, category, packetBuffer) => {
    // Получаем список позиций для текущей категории пакетов
        const positions = this.protocol.state.getPositions(category);
        
    // Инициализируем начальное смещение
        let offset = 0;
        
    // Проходим по списку полей полученного буфера
        FINAL_FIELDS.forEach(({ field, size }) => {
        // Создаем буфер для поля исходного пакета
            packet[field] = Buffer.alloc(size);
            
        // Переставляем байты в исходный порядок
            for (let i = 0; i < size; i++) {
            // Определяем текущую позицию байта
                const position = positions[offset + i];
                
            // Переставляем текущий байт
                packet[field][i] = packetBuffer[position];
            }
            
        // Обновляем смещение
            offset += size;
        });
    }
    
/*┌───────────────────────────────────┐
  │ Дешифрует буфер полезной нагрузки │
  └───────────────────────────────────┘*/
    decryptedPayload = (packet, category) => {
    // Категория пакетов авторизации
        if (category == 'AUTH') {
        // Получаем буфер полезной нагрузки (1491 байт)
            const payloadBuffer = packet.PAYLOAD;
            
        // Получаем расшифрованный буфер полезной нагрузки (1491 - 16 = 1475 байт)
            const decryptedBuffer = this.protocol.crypto.decrypt(payloadBuffer);
            
        // Сохраняем расшифрованный буфер полезной нагрузки
            payloadBuffer.set(decryptedBuffer);
        }
    }
    
/*┌───────────────────────────────────────────────────┐
  │ Декодирует буфер полезной нагрузки в список полей │
  └───────────────────────────────────────────────────┘*/
    decodePayload = (packet, category) => {
    // Получаем тип пакета
        const packetType = packet.packetType;
        
    // Получаем буфер полезной нагрузки (1491 байт)
        const payloadBuffer = packet.PAYLOAD;
        
    // Инициализируем начальное смещение
        let offset = 0;
        
    // Пропускаем поля идентификации
        offset += ID_FIELDS[category].SIZE;
        
    // Проходим по списку полей буфера полезной нагрузки
        PACKET_FIELDS[packetType].forEach(({ field, size }) => {
        // Извлекаем размер фрагмента
            if (field == 'FRAGMENT') {
                size = this.extractFragmentSize(packet);
            }
            
        // Создаем буфер поля исходного пакета
            packet[field] = Buffer.from(payloadBuffer.subarray(offset, offset + size));
            
        // Обновляем смещение
            offset += size;
        });
    }
    
/*┌──────────────────────────────────────────────┐
  │ Декодирует полученный буфер в исходный пакет │
  └──────────────────────────────────────────────┘*/
    decodePacket = (category, packetBuffer) => {
    // Создаем исходный пакет
        const packet = {
        // Список метаданных
            category, // Категория пакета
        };
        
    // Декодируем полученный буфер в список полей
        this.decodePacketBuffer(packet, category, packetBuffer);
        
    // Проверяем хэш-целостности
        if (!this.checkHash(packet)) {
            return packet;
        }
        
    // Дешифруем буфер полезной нагрузки
        this.decryptedPayload(packet, category);
        
    // Извлекаем тип пакета из буфера полезной нагрузки
        const packetType = this.extractPacketType(packet, category);
        
    // Проверяем тип пакета
        if (!packetType) {
            return packet;
        }
        
    // Добавляем тип пакета
        packet.packetType = packetType;
        
    // Декодируем буфер полезной нагрузки в список полей
        this.decodePayload(packet, category);
        
    // Возвращаем исходный пакет
        return packet;
    }
};
