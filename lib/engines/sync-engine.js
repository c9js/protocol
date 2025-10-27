/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
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
      HASH, // Хэш-сумма
    PACKET, // Весь пакет
} = require('../constants/packet-structure');

/*▄────────────────────────────────▄
  █                                █
  █  Создает движок синхронизации  █
  █                                █
  ▀────────────────────────────────▀*/
module.exports = class SyncEngine extends Engine {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(protocol) {
    // Сохраняем ссылку на основной протокол и сохраняем буфер главного ключа
        super(protocol);
        
    // Инициализируем начальное состояние
        this.initState();
    }
    
/*┌────────────────────────────────────┐
  │ Инициализирует начальное состояние │
  └────────────────────────────────────┘*/
    initState = () => {
    // Создаем начальный буфер хэш-суммы (17 байт)
        const initHashBuffer = Buffer.alloc(HASH.SIZE);
        
    // Обновляем состояние синхронизации для следующего пакета
        this.syncState(initHashBuffer);
    }
    
/*┌────────────────────────────┐
  │ Возвращает текущую позицию │
  └────────────────────────────┘*/
    getPosition = (offset) => {
        return this.positions[offset];
    }
    
/*┌─────────────────────────────────────────────────────────┐
  │ Обновляет состояние синхронизации для следующего пакета │
  └─────────────────────────────────────────────────────────┘*/
    syncState = (hashBuffer) => {
    // Обновляем буфер хэш-суммы
        this.updateHashBuffer(hashBuffer);
        
    // Обновляем буфер одноразового ключа
        this.updateKeyBuffer();
        
    // Обновляем буфер следующего ID-пакета
        this.updatePacketIdBuffer();
        
    // Обновляем список следующих позиций
        this.updatePositions();
    }
    
/*┌───────────────────────────┐
  │ Обновляет буфер хэш-суммы │
  └───────────────────────────┘*/
    updateHashBuffer = (hashBuffer) => {
        this.hashBuffer = hashBuffer;
    }
    
/*┌────────────────────────────────────┐
  │ Обновляет буфер одноразового ключа │
  └────────────────────────────────────┘*/
    updateKeyBuffer = () => {
        this.keyBuffer = this.protocol.getKeyBuffer(this.hashBuffer);
    }
    
/*┌──────────────────────────────────────┐
  │ Обновляет буфер следующего ID-пакета │
  └──────────────────────────────────────┘*/
    updatePacketIdBuffer = () => {
        this.packetIdBuffer = this.protocol.getPacketIdBuffer(this.keyBuffer);
    }
    
/*┌────────────────────────────────────┐
  │ Обновляет список следующих позиций │
  └────────────────────────────────────┘*/
    updatePositions = () => {
    // Получаем буфер дайджеста для списка следующих позиций (3016 байт)
        const digestBuffer = this.protocol.getPositionsBuffer(this.keyBuffer);
        
    // Создаем список начальных позиций [0, 1, 2, ..., PACKET.SIZE - 1] (всего 1508 элементов)
        const positions = new Array(PACKET.SIZE);
        for (let i = 0; i < positions.length; i++) positions[i] = i;
        
    // Переставляем позиции на основе данных из дайджеста (алгоритм Фишера-Йейтса)
        for (let i = 0; i < positions.length - 1; i++) {
        // Получаем индекс для обмена позициями
            const swapIndex = i + Math.floor(
                (digestBuffer.readUInt16BE(i * 2) / MAX_UINT16) * (positions.length - i)
            );
            
        // Меняем позиции местами
            [positions[i], positions[swapIndex]] = [positions[swapIndex], positions[i]];
        }
        
    // Обновляем список позиций
        this.positions = positions;
    }
};
