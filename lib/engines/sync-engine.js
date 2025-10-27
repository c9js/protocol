/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const crypto = require('crypto');
const Engine = require('../engine'); // Базовый класс для всех движков
const PACKET = require('../constants/packet-structure'); // Структура полей пакетов

/*┌─────────────────────────────┐
  │ Импортируем список констант │
  └─────────────────────────────┘*/
const {
    MAX_UINT16, // Выход за пределы двух байт в UInt16BE (65536)
    PACKETID_DEVIATIONS, // Список отклонений от базового ID-пакета (изменение первого байта)
} = require('../constants/constants');

/*┌───────────────────────────────────┐
  │ Извлекаем структуру полей пакетов │
  └───────────────────────────────────┘*/
const {
      HASH, // Хэш-сумма
    NODEID, // ID-ноды
} = PACKET;

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
    // Сохраняем буфер главного ключа и ссылку на основной протокол
        super(protocol);
        
    // Создаем уникальный буфер ID-ноды (32 байта)
        this.nodeIdBuffer = crypto.randomBytes(NODEID.SIZE);
        
    // Создаем список буферов ID-пакетов
        this.packetIdBuffers = {};
        
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
        
    // Обновляем буфер ID пакета инициализации
        this.updatePacketIdBuffer('INIT');
        
    // Обновляем буфер ID пакета синхронизации
        this.updatePacketIdBuffer('SYNC');
        
    // Сохраняем начальный список позиций
        this.initPositions = this.positions;
    }
    
/*┌─────────────────────────────────────────────────────────┐
  │ Обновляет состояние синхронизации для следующего пакета │
  └─────────────────────────────────────────────────────────┘*/
    syncState = (hashBuffer) => {
    // Обновляем буфер хэш-суммы
        this.updateHashBuffer(hashBuffer);
        
    // Обновляем буфер одноразового ключа
        this.updateKeyBuffer();
        
    // Обновляем буфер базового ID-пакета
        this.updateBasePacketIdBuffer();
        
    // Обновляем буфер ID пакета передачи данных
        this.updatePacketIdBuffer('DATA');
        
    // Обновляем буфер ID пинг-пакета
        this.updatePacketIdBuffer('PING');
        
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
    
/*┌────────────────────────────────────┐
  │ Обновляет буфер базового ID-пакета │
  └────────────────────────────────────┘*/
    updateBasePacketIdBuffer = () => {
        this.packetIdBuffers.BASE = this.protocol.getBasePacketIdBuffer(this.keyBuffer);
    }
    
/*┌───────────────────────────┐
  │ Обновляет буфер ID-пакета │
  └───────────────────────────┘*/
    updatePacketIdBuffer = (type) => {
    // Обновляем буфер ID-пакета
        this.packetIdBuffers[type] = Buffer.from(this.getPacketIdBuffer('BASE'));
        
    // Добавляем отклонение от базового ID-пакета (обновляем первый байт)
        this.packetIdBuffers[type][0] += PACKETID_DEVIATIONS[type];
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
    
/*┌─────────────────────────────────────┐
  │ Возвращает буфер ID-ноды (32 байта) │
  └─────────────────────────────────────┘*/
    getNodeIdBuffer = () => {
        return this.nodeIdBuffer;
    }
    
/*┌──────────────────────────────────────┐
  │ Возвращает буфер ID-пакета (17 байт) │
  └──────────────────────────────────────┘*/
    getPacketIdBuffer = (type) => {
        return this.packetIdBuffers[type];
    }
    
/*┌──────────────────────────────────┐
  │ Возвращает текущую позицию байта │
  └──────────────────────────────────┘*/
    getBytePosition = (type, index, offset = 0) => {
    // Возвращаем текущую позицию байта для пинг-пакетов и пакетов передачи данных
        if (type == 'PING' || type == 'DATA') {
            return this.positions[offset + index];
        }
        
    // Возвращаем текущую позицию байта для остальных пакетов
        return this.initPositions[offset + index];
    }
};
