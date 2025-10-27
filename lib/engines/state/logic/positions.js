/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const PACKET = require('../../../constants/packet-structure'); // Структура полей пакетов

/*┌─────────────────────────────┐
  │ Импортируем список констант │
  └─────────────────────────────┘*/
const {
    MAX_UINT16, // Выход за пределы двух байт в UInt16BE (65535 + 1)
} = require('../../../constants/constants');

/*▄─────────────────────────────────▄
  █                                 █
  █  Создает логику списка позиций  █
  █                                 █
  ▀─────────────────────────────────▀*/
module.exports = class PositionsState {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
        
    // Создаем списки позиций
        this.positions = {};
    }
    
/*┌──────────────────────────┐
  │ Формирует список позиций │
  └──────────────────────────┘*/
    derivePositions = (positionsBuffer) => {
    // Создаем список начальных позиций [0, 1, 2, ..., PACKET.SIZE - 1] (всего 1508 элементов)
        const positions = new Array(PACKET.SIZE);
        for (let i = 0; i < positions.length; i++) positions[i] = i;
        
    // Переставляем позиции на основе данных из дайджеста (алгоритм Фишера-Йейтса)
        for (let i = 0; i < positions.length - 1; i++) {
        // Определяем индекс для обмена позициями
            const swapIndex = i + Math.floor(
                (positionsBuffer.readUInt16BE(i * 2) / MAX_UINT16) * (positions.length - i)
            );
            
        // Меняем позиции местами
            [positions[i], positions[swapIndex]] = [positions[swapIndex], positions[i]];
        }
        
    // Возвращаем список позиций
        return positions;
    }
    
/*┌────────────────────────────────────────────────────────┐
  │ Обновляет список позиций для текущей категории пакетов │
  └────────────────────────────────────────────────────────┘*/
    updatePositions = (category, positionsBuffer) => {
        this.positions[category] = this.derivePositions(positionsBuffer);
    }
    
/*┌─────────────────────────────────────────────────────────┐
  │ Возвращает список позиций для текущей категории пакетов │
  └─────────────────────────────────────────────────────────┘*/
    getPositions = (category) => {
        return this.positions[category];
    }
};
