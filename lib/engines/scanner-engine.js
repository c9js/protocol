/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const { Scanner } = require('l2raw'); // Приемник
const Engine = require('../engine'); // Базовый класс для всех движков

/*┌────────────────────────────────────┐
  │ Импортируем структуру полей пакета │
  └────────────────────────────────────┘*/
const {
    PACKETID, // ID-пакета
      PACKET, // Весь пакет
} = require('../constants/packet-structure');

/*▄────────────────────────────────────▄
  █                                    █
  █  Создает движок получения пакетов  █
  █                                    █
  ▀────────────────────────────────────▀*/
module.exports = class ScannerEngine extends Engine {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(protocol) {
    // Сохраняем буфер главного ключа и ссылку на основной протокол
        super(protocol);
        
    // Создаем список фрагментов для сборки исходного сообщения
        this.fragments = [];
        
    // Создаем приемник
        this.scanner = new Scanner({
            iface: this.protocol.options.iface, // Имя сетевого интерфейса
        });
        
    // Добавляем обработчик получения пакетов
        this.scanner.on('data', this.onPacket);
    }
    
/*┌─────────────────────┐
  │ Проверяет ID-пакета │
  └─────────────────────┘*/
    checkPacketId = (type, packetBuffer, packetIdBuffer) => {
    // Проверяем каждый байт ID-пакета (17 байт)
        for (let i = 0; i < PACKETID.SIZE; i++) {
        // Получаем текущую позицию байта
            const position = this.protocol.getPosition(type, i, PACKETID.OFFSET);
            
        // Проверяем текущую позицию байта
            if (packetBuffer[position] != packetIdBuffer[i]) {
                return false;
            }
        }
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌───────────────────────────────┐
  │ Проверяет пакет синхронизации │
  └───────────────────────────────┘*/
    checkSyncPacket = (packetBuffer) => {
    // Проверяем временный запрет на обработку пакетов синхронизации
        if (this.syncTimeLocked) return;
        
    // Проверяем ID-пакета
        return this.checkPacketId('SYNC', packetBuffer, this.protocol.syncPacketIdBuffer);
    }
    
/*┌──────────────────────┐
  │ Проверяет пинг-пакет │
  └──────────────────────┘*/
    checkPingPacket = (packetBuffer) => {
        return this.checkPacketId('PING', packetBuffer, this.protocol.pingPacketIdBuffer);
    }
    
/*┌─────────────────────────────────┐
  │ Проверяет пакет передачи данных │
  └─────────────────────────────────┘*/
    checkDataPacket = (packetBuffer) => {
        return this.checkPacketId('DATA', packetBuffer, this.protocol.dataPacketIdBuffer);
    }
    
/*┌─────────────────────┐
  │ Проверяет хэш-сумму │
  └─────────────────────┘*/
    checkHash = (dataPacket) => {
    // Получаем буфер хэш-суммы
        const hashBuffer = this.protocol.getHashBuffer(dataPacket.LENGTH, dataPacket.FRAGMENT);
        
    // Проверяем хэш-сумму
        return hashBuffer.equals(dataPacket.HASH);
    }
    
/*┌──────────────────────────────────────────────┐
  │ Запускает процесс сборки исходного сообщения │
  └──────────────────────────────────────────────┘*/
    buildMessage = (dataPacket) => {
    // Добавляем фрагмент в список фрагментов
        this.fragments.push(dataPacket.FRAGMENT);
        
    // Это не последний фрагмент
        if (!dataPacket.isLast) return;
        
    // Декодируем список фрагментов в буфер исходного сообщения
        const messageBuffer = this.protocol.decode(this.fragments);
        
    // Очищаем список фрагментов
        this.fragments = [];
        
    // Переводим буфер исходного сообщения в строку
        const message = messageBuffer.toString();
        
    // Сообщаем о получении нового сообщения
        this.protocol.emit('message', message);
    }
    
/*┌───────────────────────────────┐
  │ Обрабатывает полученный пакет │
  └───────────────────────────────┘*/
    handlePacket = (type, packetBuffer) => {
    // Извлекаем исходный пакет из полученного пакета
        const packet = this.protocol.extractPacket(type, packetBuffer);
        
    // Пакет передачи данных
        if (type == 'DATA') {
        // Проверяем хэш-сумму
            if (!this.checkHash(packet)) return;
            
        // Запускаем процесс сборки исходного сообщения
            this.buildMessage(packet);
        }
        
    // Обновляем состояние синхронизации для следующего пакета
        this.protocol.syncState(packet.HASH);
        
    // Запускаем следующий цикл отправки пакетов
        this.protocol.runSendCycle();
        
    // Устанавливаем временный запрет на обработку пакетов синхронизации
        this.setSyncTimeLocked();
        
    // Выводим в консоль
        $.log(packet.HASH.toString('hex').slice(0, 4));
    }
    
/*┌───────────────────────────────────────────────────────────────────┐
  │ Устанавливает временный запрет на обработку пакетов синхронизации │
  └───────────────────────────────────────────────────────────────────┘*/
    setSyncTimeLocked = () => {
    // Отменяем предыдущий запрет
        clearTimeout(this.syncTimeLocked);
        
    // Устанавливаем текущий запрет
        this.syncTimeLocked = setTimeout(() => {
        // Снимаем текущий запрет
            this.syncTimeLocked = null;
        },
        
        // Время на текущий запрет (по умолчанию 10 сек)
            this.protocol.syncLockTimeout
        );
    }
    
/*┌──────────────────────────────┐
  │ Обработчик получения пакетов │
  └──────────────────────────────┘*/
    onPacket = (packetBuffer) => {
    // Проверяем размер пакета (1508 байт)
        if (packetBuffer.length != PACKET.SIZE) return;
        
    // Получен пакет синхронизации
        if (this.checkSyncPacket(packetBuffer)) {
            return this.handlePacket('SYNC', packetBuffer);
        }
        
    // Получен пинг-пакет
        if (this.checkPingPacket(packetBuffer)) {
            return this.handlePacket('PING', packetBuffer);
        }
        
    // Получен пакет передачи данных
        if (this.checkDataPacket(packetBuffer)) {
            return this.handlePacket('DATA', packetBuffer);
        }
    }
};
