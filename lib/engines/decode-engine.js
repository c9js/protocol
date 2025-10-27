/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const Engine = require('../engine'); // Базовый класс для всех движков

/*┌────────────────────────────────────┐
  │ Импортируем структуру полей пакета │
  └────────────────────────────────────┘*/
const {
    PACKETID, // ID-пакета
      PACKET, // Весь пакет
} = require('../constants/packet-structure');

/*┌─────────────────────────────────┐
  │ Импортируем списки полей пакета │
  └─────────────────────────────────┘*/
const {
    BASE_FIELDS, // Список полей исходного пакета
} = require('../constants/packet-fields');

/*▄────────────────────────────────▄
  █                                █
  █  Создает движок декодирования  █
  █                                █
  ▀────────────────────────────────▀*/
module.exports = class DecodeEngine extends Engine {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(protocol) {
    // Сохраняем ссылку на основной протокол и сохраняем буфер главного ключа
        super(protocol);
        
    // Создаем очередь для получения пакетов
        this.pending = [];
    }
    
/*┌──────────────────────────────────────────────────────────┐
  │ Добавляет новый полученный пакет в очередь для получения │
  └──────────────────────────────────────────────────────────┘*/
    addPacket = (packetBuffer) => {
    // Проверяем размер пакета (1508 байт)
        if (packetBuffer.length != PACKET.SIZE) return;
        
    // Проверяем ID-пакета
        if (!this.checkPacketId(packetBuffer)) {
        // Проверяем ID-пакета для повторной синхронизации
            // if (!this.checkInitPacketId(packetBuffer)) return;
            
        // Получен пакет для повторной синхронизации
            0;
        }
        
    // Извлекаем исходный пакет из полученного пакета
        const packet = this.extractPacket(packetBuffer);
        
    // Проверяем хэш-сумму
        if (!this.checkHash(packet)) return;
        
    // Добавляем исходный пакет в очередь для получения
        this.pending.push(packet);
    }
    
/*┌────────────────────────────────────────────────┐
  │ Извлекает исходный пакет из полученного пакета │
  └────────────────────────────────────────────────┘*/
    extractPacket= (packetBuffer) => {
    // Создаем исходный пакет
        const packet = {};
        
    // Проходим по списку полей исходного пакета
        BASE_FIELDS.forEach(([field, { OFFSET, SIZE }]) => {
        // Создаем буфер поля исходного пакета
            packet[field] = Buffer.alloc(SIZE);
            
        // Переставляем байты в исходный порядок
            for (let i = 0; i < SIZE; i++) {
                packet[field][i] = packetBuffer[this.protocol.getPosition(OFFSET + i)];
            }
        });
        
    // Возвращаем исходный пакет из полученного пакета
        return packet;
    }
    
/*┌─────────────────────┐
  │ Проверяет ID-пакета │
  └─────────────────────┘*/
    checkPacketId = (packetBuffer) => {
    // Проверяем каждый байт ID-пакета
        for (let i = 0; i < PACKETID.SIZE; i++) {
        // Получаем текущую позицию байта
            const position = this.protocol.getPosition(PACKETID.OFFSET + i);
            
        // Проверяем текущую позицию байта
            if (packetBuffer[position] != this.protocol.packetIdBuffer[i]) {
                return false;
            }
        }
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌─────────────────────┐
  │ Проверяет хэш-сумму │
  └─────────────────────┘*/
    checkHash = (packet) => {
    // Получаем буфер хэш-суммы
        const hashBuffer = this.protocol.getHashBuffer(packet.LENGTH, packet.FRAGMENT);
        
    // Проверяем хэш-сумму
        if (!hashBuffer.equals(packet.HASH)) {
            return false;
        }
        
    // Проверка прошла успешно
        return true;
    }
};
