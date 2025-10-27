/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const crypto = require('crypto');
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
} = require('../../../constants/packet-fields');

/*┌───────────────────────────────────┐
  │ Извлекаем структуру полей пакетов │
  └───────────────────────────────────┘*/
const {
// Финальный буфер
    HASH, // Хэш-целостности
} = PACKET;

/*▄────────────────────────────▄
  █                            █
  █  Создает логику состояний  █
  █                            █
  ▀────────────────────────────▀*/
module.exports = class StateState {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
        
    // Инициализируем список размеров для буферов состояний
        this.initStateSize();
    }
    
/*┌──────────────────────────────────────────────────────┐
  │ Инициализирует список размеров для буферов состояний │
  └──────────────────────────────────────────────────────┘*/
    initStateSize = () => {
    // Создаем список размеров для буферов состояний
        this.STATE_SIZE = {};
        
    // Проходим по списку категорий пакетов
        for (const category in CATEGORY) {
        // Инициализируем начальный размер буфера состояния
            this.STATE_SIZE[category] = 0;
            
        // Добавляем размер полей идентификации
            this.STATE_SIZE[category] += ID_FIELDS[category].SIZE;
            
        // Добавляем размер списка позиций (1508 * 2 = 3016 байт)
            this.STATE_SIZE[category] += PACKET.SIZE * 2;
        }
    }
    
/*┌──────────────────────────────────────────────────────────────────┐
  │ Формирует список буферов состояний для текущей категории пакетов │
  └──────────────────────────────────────────────────────────────────┘*/
    deriveStateBuffers = (category, hashBuffer) => {
    // Получаем размер буфера состояния для текущей категории пакетов
        const size = this.STATE_SIZE[category];
        
    // Формируем буфер состояния для текущей категории пакетов
        const stateBuffer = this.protocol.hash.deriveStateBuffer(size, hashBuffer);
        
    // Создаем список буферов состояний
        const stateBuffers = {};
        
    // Инициализируем начальное смещение
        let offset = 0;
        
    // Проходим по списку полей идентификации
        ID_FIELDS[category].forEach(({ field, size }) => {
        // Извлекаем буфер состояния для текущего поля
            stateBuffers[field] = stateBuffer.subarray(offset, offset + size);
            
        // Обновляем смещение
            offset += size;
        });
        
    // Извлекаем буфер состояния для списка позиций (1508 * 2 = 3016 байт)
        stateBuffers.POSITIONS = stateBuffer.subarray(offset, offset + size);
        
    // Возвращаем список буферов состояний
        return stateBuffers;
    }
    
/*┌────────────────────────────────────┐
  │ Инициализирует начальное состояние │
  └────────────────────────────────────┘*/
    initState = () => {
    // Создаем начальный хэш-буфер (17 байт)
        const initHashBuffer = Buffer.alloc(HASH.SIZE);
        
    // Обновляем состояние для категории пакетов авторизации
        this.updateState('AUTH', initHashBuffer);
        
    // Создаем случайный хэш-буфер (17 байт)
        const randomHashBuffer = crypto.randomBytes(HASH.SIZE);
        
    // Обновляем состояние для категории пакетов синхронизации
        this.updateState('SYNC', randomHashBuffer);
    }
    
/*┌───────────────────────────────────────────────────┐
  │ Обновляет состояние для текущей категории пакетов │
  └───────────────────────────────────────────────────┘*/
    updateState = (category, hashBuffer) => {
    // Формируем список буферов состояний для текущей категории пакетов
        const stateBuffers = this.deriveStateBuffers(category, hashBuffer);
        
    // Обновляем список буферов типов пакетов для текущей категории пакетов
        this.engine.packetType.updatePacketTypeBuffers(category, stateBuffers.TYPE);
        
    // Обновляем список позиций для текущей категории пакетов
        this.engine.positions.updatePositions(category, stateBuffers.POSITIONS);
        
    // Обновляем состояние для категории пакетов авторизации
        if (category == 'AUTH') {
        // Обновляем буфер отправителя пакета
            this.engine.origin.updateOriginBuffer();
        }
        
    // Обновляем состояние для категории пакетов синхронизации
        if (category == 'SYNC') {
        // Обновляем буфер проверочного маркера
            this.engine.marker.updateMarkerBuffer(stateBuffers.MARKER);
        }
    }
};
