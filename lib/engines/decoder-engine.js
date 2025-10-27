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
    FRAGMENT, // Фрагмент
} = require('../constants/packet-structure');

/*┌─────────────────────────────────┐
  │ Импортируем списки полей пакета │
  └─────────────────────────────────┘*/
const {
    SCAN_FIELDS, // Списки полей полученных пакетов
} = require('../constants/packet-fields');

/*▄────────────────────────────────▄
  █                                █
  █  Создает движок декодирования  █
  █                                █
  ▀────────────────────────────────▀*/
module.exports = class DecoderEngine extends Engine {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(protocol) {
    // Сохраняем буфер главного ключа и ссылку на основной протокол
        super(protocol);
    }
    
/*┌────────────────────────────────────────────────┐
  │ Извлекает исходный пакет из полученного пакета │
  └────────────────────────────────────────────────┘*/
    extractPacket = (type, packetBuffer) => {
    // Создаем исходный пакет
        const packet = {};
        
    // Добавляем тип пакета
        packet.type = type;
        
    // Проходим по списку полей полученного пакета
        SCAN_FIELDS[type].forEach(([field, { OFFSET, SIZE }]) => {
        // Извлекаем размер фрагмента
            if (field == 'FRAGMENT') SIZE = this.extractFragmentSize(packet);
            
        // Создаем буфер поля исходного пакета
            packet[field] = Buffer.alloc(SIZE);
            
        // Переставляем байты в исходный порядок
            for (let i = 0; i < SIZE; i++) {
                packet[field][i] = packetBuffer[this.protocol.getPosition(type, i, OFFSET)];
            }
        });
        
    // Возвращаем исходный пакет
        return packet;
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
    
/*┌──────────────────────────────────────────────────────────┐
  │ Декодирует список фрагментов в буфер исходного сообщения │
  └──────────────────────────────────────────────────────────┘*/
    decode = (fragments) => {
    // Переводим список фрагментов в зашифрованный буфер исходного сообщения
        const encryptedBuffer = Buffer.concat(fragments);
        
    // Получаем расшифрованный буфер исходного сообщения
        const messageBuffer = this.protocol.getDecryptedBuffer(encryptedBuffer);
        
    // Возвращаем буфер исходного сообщения
        return messageBuffer;
    }
};
