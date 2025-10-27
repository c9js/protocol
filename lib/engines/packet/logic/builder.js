/*┌──────────────────────────────────────┐
  │ Импортируем список категорий пакетов │
  └──────────────────────────────────────┘*/
const {
    TYPE_CATEGORY, // Список типов пакетов содержащих свою категорию
} = require('../../../constants/packet-categories');

/*┌──────────────────────────────────┐
  │ Импортируем списки полей пакетов │
  └──────────────────────────────────┘*/
const {
        ID_FIELDS, // Списки полей идентификации
    PACKET_FIELDS, // Списки полей пакетов отправки
} = require('../../../constants/packet-fields');

/*▄──────────────────────────────────────────▄
  █                                          █
  █  Создает логику сборки исходных пакетов  █
  █                                          █
  ▀──────────────────────────────────────────▀*/
module.exports = class BuilderPacket {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌─────────────────────────────────────┐
  │ Возвращает буфер поля идентификации │
  └─────────────────────────────────────┘*/
    getIdFieldBuffer = (packetType, field) => {
    // Тип пакета
        if (field == 'TYPE') {
            return this.protocol.state.getPacketTypeBuffer(packetType);
        }
        
    // Проверочный маркер
        if (field == 'MARKER') {
            return this.protocol.state.getMarkerBuffer();
        }
    }
    
/*┌──────────────────────────────────┐
  │ Создает пакет начала авторизации │
  └──────────────────────────────────┘*/
    createInitPacket = () => {
    // Инициализируем тип пакета
        const packetType = 'INIT';
        
    // Получаем поле отправителя пакета
        const ORIGIN = this.protocol.state.getOriginBuffer();
        
    // Создаем пакет начала авторизации
        return this.createPacket(packetType, {
            ORIGIN, // Отправитель пакета
        });
    }
    
/*┌─────────────────────────────────────────┐
  │ Создает пакет подтверждения авторизации │
  └─────────────────────────────────────────┘*/
    createSignPacket = (TARGET) => {
    // Инициализируем тип пакета
        const packetType = 'SIGN';
        
    // Получаем поле отправителя пакета
        const ORIGIN = this.protocol.state.getOriginBuffer();
        
    // Создаем пакет подтверждения авторизации
        return this.createPacket(packetType, {
            ORIGIN, // Отправитель пакета
            TARGET, // Получатель пакета
        });
    }
    
/*┌──────────────────────────────────────┐
  │ Создает пакет завершения авторизации │
  └──────────────────────────────────────┘*/
    createDonePacket = (TARGET) => {
    // Инициализируем тип пакета
        const packetType = 'DONE';
        
    // Получаем поле отправителя пакета
        const ORIGIN = this.protocol.state.getOriginBuffer();
        
    // Создаем пакет завершения авторизации
        return this.createPacket(packetType, {
            ORIGIN, // Отправитель пакета
            TARGET, // Получатель пакета
        });
    }
    
/*┌───────────────────────────────┐
  │ Создает пакет передачи данных │
  └───────────────────────────────┘*/
    createDataPacket = () => {
    // Инициализируем тип пакета
        const packetType = 'DATA';
        
    // Извлекаем следующий пакет передачи данных из очереди
        const nextPacket = this.protocol.message.extractNextPacket();
        
    // Извлекаем список полей
        const {
              LENGTH, // Длина фрагмента
            FRAGMENT, // Фрагмент
        } = nextPacket;
        
    // Создаем пакет передачи данных
        return this.createPacket(packetType, {
              LENGTH, // Длина фрагмента
            FRAGMENT, // Фрагмент
        });
    }
    
/*┌────────────────────┐
  │ Создает пинг-пакет │
  └────────────────────┘*/
    createPingPacket = () => {
    // Инициализируем тип пакета
        const packetType = 'PING';
        
    // Создаем пинг-пакет
        return this.createPacket(packetType);
    }
    
/*┌─────────────────────┐
  │ Создает новый пакет │
  └─────────────────────┘*/
    createPacket = (packetType, fields) => {
    // Получаем категорию пакета
        const category = TYPE_CATEGORY[packetType];
        
    // Создаем новый пакет
        const packet = {
        // Список метаданных
              category, // Категория пакета
            packetType, // Тип пакета
        };
        
    // Добавляем список полей идентификации
        ID_FIELDS[category].forEach(({ field }) => {
            packet[field] = this.getIdFieldBuffer(packetType, field);
        });
        
    // Добавляем список полей пакета отправки
        PACKET_FIELDS[packetType].forEach(({ field }) => {
            packet[field] = fields[field];
        });
        
    // Кодируем список полей в буфер полезной нагрузки
        packet.PAYLOAD = this.engine.encoder.encodePayload(packet, category, packetType);
        
    // Добавляем хэш-целостности
        packet.HASH = this.protocol.hash.deriveHashBuffer(packet.PAYLOAD);
        
    // Кодируем исходный пакет в буфер отправки
        packet.packetBuffer = this.engine.encoder.encodePacket(packet, category);
        
    // Возвращаем новый пакет
        return packet;
    }
    
/*┌───────────────────────────────────────────────────────────────────┐
  │ Создает исходный пакет отправки для категории пакетов авторизации │
  └───────────────────────────────────────────────────────────────────┘*/
    createAuthPacket = (packetType, targetBuffer) => {
    // Создаем пакет начала авторизации
        if (packetType == 'INIT') {
            return this.createInitPacket();
        }
        
    // Создаем пакет подтверждения авторизации
        if (packetType == 'SIGN') {
            return this.createSignPacket(targetBuffer);
        }
        
    // Создаем пакет завершения авторизации
        if (packetType == 'DONE') {
            return this.createDonePacket(targetBuffer);
        }
    }
    
/*┌─────────────────────────────────────────────────────────────────────┐
  │ Создает исходный пакет отправки для категории пакетов синхронизации │
  └─────────────────────────────────────────────────────────────────────┘*/
    createSyncPacket = () => {
    // Создаем пакет передачи данных
        if (this.protocol.message.hasMessage()) {
            return this.createDataPacket();
        }
        
    // Создаем пинг-пакет
        return this.createPingPacket();
    }
};
