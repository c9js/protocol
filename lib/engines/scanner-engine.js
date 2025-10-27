/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const { Scanner } = require('l2raw'); // Приемник
const Engine = require('../engine'); // Базовый класс для всех движков
const PACKET = require('../constants/packet-structure'); // Структура полей пакетов

/*┌───────────────────────────────────┐
  │ Извлекаем структуру полей пакетов │
  └───────────────────────────────────┘*/
const {
    PACKETID, // ID-пакета
} = PACKET;

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
    checkPacketId = (type, packetBuffer) => {
    // Получаем буфер ID-пакета (17 байт)
        const packetIdBuffer = this.protocol.getPacketIdBuffer(type);
        
    // Проверяем каждый байт ID-пакета (17 байт)
        for (let i = 0; i < PACKETID.SIZE; i++) {
        // Получаем текущую позицию байта
            const position = this.protocol.getBytePosition(type, i, PACKETID.OFFSET);
            
        // Проверяем текущую позицию байта
            if (packetIdBuffer[i] != packetBuffer[position]) {
                return false;
            }
        }
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌───────────────────────────────┐
  │ Проверяет пакет инициализации │
  └───────────────────────────────┘*/
    checkInitPacket = (packetBuffer) => {
    // Проверяем временный запрет на обработку пакетов инициализации
        // if (this.syncTimeLocked) return;
        // TODO Удалить закомментированный код
        
    // Проверяем ID-пакета
        return this.checkPacketId('INIT', packetBuffer);
        // TODO
        // Метод не используется!
        // Удалить метод!
    }
    
/*┌───────────────────────────────┐
  │ Проверяет пакет синхронизации │
  └───────────────────────────────┘*/
    checkSyncPacket = (packetBuffer) => {
    // Проверяем временный запрет на обработку пакетов синхронизации
        // if (this.syncTimeLocked) return;
        // TODO Удалить закомментированный код
        
    // Проверяем ID-пакета
        return this.checkPacketId('SYNC', packetBuffer);
        // TODO
        // Метод не используется!
        // Удалить метод!
    }
    
/*┌─────────────────────────────────┐
  │ Проверяет пакет передачи данных │
  └─────────────────────────────────┘*/
    checkDataPacket = (packetBuffer) => {
        return this.checkPacketId('DATA', packetBuffer);
        // TODO
        // Метод не используется!
        // Удалить метод!
    }
    
/*┌──────────────────────┐
  │ Проверяет пинг-пакет │
  └──────────────────────┘*/
    checkPingPacket = (packetBuffer) => {
        return this.checkPacketId('PING', packetBuffer);
        // TODO
        // Метод не используется!
        // Удалить метод!
    }
    
/*┌───────────────────┐
  │ Проверяет ID-ноды │
  └───────────────────┘*/
    checkNodeId = (initPacket) => {
    // Получаем буфер ID-ноды (32 байта)
        const nodeIdBuffer = this.protocol.getNodeIdBuffer();
        
    // Получен свой же пакет
        if (nodeIdBuffer.equals(initPacket.NODEID)) return false;
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌─────────────────────┐
  │ Проверяет хэш-сумму │
  └─────────────────────┘*/
    checkHash = (dataPacket) => {
    // Получаем буфер длины фрагмента (2 байта)
        const lengthBuffer = dataPacket.LENGTH;
        
    // Получаем буфер фрагмента (до 1472 байт)
        const fragmentBuffer = dataPacket.FRAGMENT;
        
    // Получаем буфер хэш-суммы (17 байт)
        const hashBuffer = this.protocol.getHashBuffer(lengthBuffer, fragmentBuffer);
        
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
    
/*┌───────────────────────────────────────────────────────────┐
  │ Устанавливает временный запрет на повторную синхронизацию │
  └───────────────────────────────────────────────────────────┘*/
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
    
/*┌───────────────────────────────┐
  │ Обрабатывает полученный пакет │
  └───────────────────────────────┘*/
    handlePacket = (type, packetBuffer) => {
    // Извлекаем исходный пакет из полученного пакета
        const packet = this.protocol.extractPacket(type, packetBuffer);
        
    // Пакет инициализации
        if (type == 'INIT') {
        // Проверяем ID-ноды
            if (!this.checkNodeId(packet)) return;
            
        // Очищаем очередь для отправки
            this.protocol.clearPending();
            
        // Очищаем список фрагментов для сборки исходного сообщения
            this.fragments = [];
            
            // упаковать строку выше в метод
            
            // SYNC
            // поменять
            // на
            // AUTH
            
            // или
            // вообще оставить
            // один тип пакета
            // и назвать его
            // AUTH
            
        // Выводим в консоль
            // _='--------------------------------'
        }
        
    // Пакет передачи данных
        if (type == 'DATA') {
        // Проверяем хэш-сумму
            if (!this.checkHash(packet)) return;
            
        // Запускаем процесс сборки исходного сообщения
            this.buildMessage(packet);
        }
        
    // Сообщаем о получении пакета
        this.protocol.emit('data', type, packetBuffer);
        
    // Обновляем состояние синхронизации для следующего пакета
        this.protocol.syncState(packet.HASH);
        
    // Запускаем следующий цикл отправки пакетов
        this.protocol.runSendCycle();
        
    // Устанавливаем временный запрет на повторную синхронизацию
        this.setSyncTimeLocked();
    }
    
/*┌──────────────────────────────┐
  │ Обработчик получения пакетов │
  └──────────────────────────────┘*/
    onPacket = (packetBuffer) => {
    // Проверяем размер пакета (1508 байт)
        if (packetBuffer.length != PACKET.SIZE) return;
        
    // Получен пинг-пакет
        if (this.checkPacketId('PING', packetBuffer)) {
            return this.handlePacket('PING', packetBuffer);
        }
        
    // Получен пакет передачи данных
        if (this.checkPacketId('DATA', packetBuffer)) {
            return this.handlePacket('DATA', packetBuffer);
        }
        
    // Временный запрет на обработку пакетов инициализации и синхронизации
        if (this.syncTimeLocked) return;
        
    // Получен пакет инициализации
        if (this.checkPacketId('INIT', packetBuffer)) {
            return this.handlePacket('INIT', packetBuffer);
        }
        
    // Получен пакет синхронизации
        if (this.checkPacketId('SYNC', packetBuffer)) {
            return this.handlePacket('SYNC', packetBuffer);
        }
    }
};
