/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const PACKET = require('../../../constants/packet-structure'); // Структура полей пакетов

/*┌───────────────────────────────────┐
  │ Извлекаем структуру полей пакетов │
  └───────────────────────────────────┘*/
const {
// Все категории пакетов
      TYPE, // Тип пакета
    
// Категория пакетов синхронизации
    MARKER, // Проверочный маркер
} = PACKET;

/*▄────────────────────────────────────▄
  █                                    █
  █  Создает логику получения пакетов  █
  █                                    █
  ▀────────────────────────────────────▀*/
module.exports = class ScannerIo {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌─────────────────────────────────────────────────────────┐
  │ Устанавливает временный запрет на повторную авторизацию │
  └─────────────────────────────────────────────────────────┘*/
    setAuthTimeLocked = () => {
    // Отменяем предыдущий запрет
        clearTimeout(this.authTimeLocked);
        
    // Устанавливаем текущий запрет
        this.authTimeLocked = setTimeout(() => {
        // Снимаем текущий запрет
            this.authTimeLocked = null;
        },
        
        // Время на текущий запрет (по умолчанию 10 сек)
            this.protocol.options.authLockTimeout,
        );
    }
    
/*┌──────────────────────────────┐
  │ Проверяет отправителя пакета │
  └──────────────────────────────┘*/
    checkOrigin = (packet) => {
    // Получаем буфер отправителя пакета (32 байта)
        const originBuffer = this.protocol.state.getOriginBuffer();
        
    // Получен свой же пакет
        if (originBuffer.equals(packet.ORIGIN)) return;
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌─────────────────────────────┐
  │ Проверяет получателя пакета │
  └─────────────────────────────┘*/
    checkTarget = (packet) => {
    // Получаем буфер отправителя пакета (32 байта)
        const originBuffer = this.protocol.state.getOriginBuffer();
        
    // Получатель пакета не мы
        if (!originBuffer.equals(packet.TARGET)) return;
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌─────────────────────────────────────────┐
  │ Проверяет категорию пакетов авторизации │
  └─────────────────────────────────────────┘*/
    checkAuth = (packet, category) => {
    // Проверяем категорию пакетов авторизации
        if (category != 'AUTH') return;
        
    // Проверяем отправителя пакета
        if (!this.checkOrigin(packet)) return;
        
    // Пакет подтверждения авторизации
        if (packet.packetType == 'SIGN') {
        // Проверяем получателя пакета
            if (!this.checkTarget(packet)) return;
        }
        
    // Пакет завершения авторизации
        if (packet.packetType == 'DONE') {
        // Проверяем получателя пакета
            if (!this.checkTarget(packet)) return;
        }
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌───────────────────────────────────────────┐
  │ Проверяет категорию пакетов синхронизации │
  └───────────────────────────────────────────┘*/
    checkSync = (packetBuffer) => {
    // Инициализируем категорию пакета
        const category = 'SYNC';
        
    // Получаем буфер проверочного маркера (16 байт)
        const markerBuffer = this.protocol.state.getMarkerBuffer();
        
    // Получаем список позиций для текущей категории пакетов
        const positions = this.protocol.state.getPositions(category);
        
    // Получаем позицию проверочного маркера в буфере полезной нагрузки (идет сразу после TYPE)
        const offset = TYPE.SIZE;
        
    // Проверяем каждый байт проверочного маркера
        for (let i = 0; i < MARKER.SIZE; i++) {
        // Получаем текущую позицию байта
            const position = positions[offset + i];
            
        // Проверяем текущую позицию байта
            if (markerBuffer[i] != packetBuffer[position]) {
                return false;
            }
        }
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌───────────────────────────────┐
  │ Обрабатывает полученный буфер │
  └───────────────────────────────┘*/
    handlePacket = (category, packetBuffer) => {
    // Декодируем полученный буфер в исходный пакет
        const packet = this.protocol.packet.decodePacket(category, packetBuffer);
        
    // Проверяем тип пакета
        if (!packet.packetType) return;
        
    // Категория пакетов авторизации
        if (this.checkAuth(packet, category)) {
        // Обрабатываем полученный пакет авторизации
            this.protocol.flow.handlePacket(packet, category, packetBuffer);
            
        // Пакет подтверждения авторизации
            if (packet.packetType == 'SIGN') {
            // Устанавливаем временный запрет на повторную авторизацию
                this.setAuthTimeLocked();
            }
            
        // Пакет завершения авторизации
            if (packet.packetType == 'DONE') {
            // Устанавливаем временный запрет на повторную авторизацию
                this.setAuthTimeLocked();
            }
        }
        
    // Категория пакетов синхронизации
        if (category == 'SYNC') {
        // Обрабатываем полученный пакет синхронизации
            this.protocol.flow.handlePacket(packet, category, packetBuffer);
            
        // Устанавливаем временный запрет на повторную авторизацию
            this.setAuthTimeLocked();
        }
    }
    
/*┌──────────────────────────────┐
  │ Обработчик получения пакетов │
  └──────────────────────────────┘*/
    onPacket = (packetBuffer) => {
    // Проверяем размер пакета (1508 байт)
        if (packetBuffer.length != PACKET.SIZE) return;
        
    // Получен пакет из категории пакетов синхронизации
        if (this.checkSync(packetBuffer)) {
            this.handlePacket('SYNC', packetBuffer);
        }
        
    // Временный запрет на обработку пакетов авторизации
        if (this.authTimeLocked) return;
        
    // Обрабатываем пакет авторизации
        this.handlePacket('AUTH', packetBuffer);
    }
};
