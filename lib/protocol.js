/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const EventEmitter = require('core/event-emitter/default-options');

/*┌────────────────────────────┐
  │ Импортируем список движков │
  └────────────────────────────┘*/
const {
     CryptoEngine, // Движок шифрования
       HashEngine, // Движок хеширования
       SyncEngine, // Движок синхронизации
    EncoderEngine, // Движок кодирования
    DecoderEngine, // Движок декодирования
    ScannerEngine, // Движок получения пакетов
     SenderEngine, // Движок отправки пакетов
} = require('./engines');

/*▄──────────────────────────▄
  █                          █
  █  Создает новый протокол  █
  █                          █
  ▀──────────────────────────▀*/
module.exports = class Protocol extends EventEmitter.DefaultOptions {
/*┌────────────────────┐
  │ Опции по умолчанию │
  └────────────────────┘*/
    static defaultOptions = {
                  iface: 'eth0', // Имя сетевого интерфейса
              masterKey: '1234', // Главный ключ (строка)
        syncLockTimeout:  10000, // Время на запрет повторной синхронизации = 10 сек
    }
    
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(options) {
    // Сохраняем опции с учетом значений по умолчанию
        super(options);
        
    // Инициализируем буфер главного ключа
        this.initMasterKeyBuffer();
        
    // Инициализируем движки
        this.initEngines();
    }
    
/*┌─────────────────────────────────────┐
  │ Инициализирует буфер главного ключа │
  └─────────────────────────────────────┘*/
    initMasterKeyBuffer = () => {
        this.masterKeyBuffer = HashEngine.getMasterKeyBuffer(this.options.masterKey);
    }
    
/*┌───────────────────────┐
  │ Инициализирует движки │
  └───────────────────────┘*/
    initEngines = () => {
    // Создаем список движков
        [
            [ 'cryptoEngine',  CryptoEngine], // Движок шифрования
            [   'hashEngine',    HashEngine], // Движок хеширования
            [   'syncEngine',    SyncEngine], // Движок синхронизации
            ['encoderEngine', EncoderEngine], // Движок кодирования
            ['decoderEngine', DecoderEngine], // Движок декодирования
            ['scannerEngine', ScannerEngine], // Движок получения пакетов
            [ 'senderEngine',  SenderEngine], // Движок отправки пакетов
        ]
        
    // Инициализируем каждый движок
        .forEach(([name, Engine]) => this[name] = new Engine(this));
    }
    
/*┌────────────────────────────────────────────────────┐
  │ Возвращает зашифрованный буфер исходного сообщения │
  └────────────────────────────────────────────────────┘*/
    getEncryptedBuffer = (messageBuffer) => {
        return this.cryptoEngine.encrypt(messageBuffer);
    }
    
/*┌─────────────────────────────────────────────────────┐
  │ Возвращает расшифрованный буфер исходного сообщения │
  └─────────────────────────────────────────────────────┘*/
    getDecryptedBuffer = (encryptedBuffer) => {
        return this.cryptoEngine.decrypt(encryptedBuffer);
    }
    
/*┌────────────────────────────────────────────────┐
  │ Возвращает буфер одноразового ключа (32 байта) │
  └────────────────────────────────────────────────┘*/
    getKeyBuffer = (hashBuffer) => {
        return this.hashEngine.getKeyBuffer(hashBuffer);
    }
    
/*┌─────────────────────────────────────────────────────────────────────┐
  │ Возвращает буфер дайджеста для списка следующих позиций (3016 байт) │
  └─────────────────────────────────────────────────────────────────────┘*/
    getPositionsBuffer = (keyBuffer) => {
        return this.hashEngine.getPositionsBuffer(keyBuffer);
    }
    
/*┌───────────────────────────────────────────────┐
  │ Возвращает буфер базового ID-пакета (17 байт) │
  └───────────────────────────────────────────────┘*/
    getBasePacketIdBuffer = (keyBuffer) => {
        return this.hashEngine.getBasePacketIdBuffer(keyBuffer);
    }
    
/*┌──────────────────────────────────────┐
  │ Возвращает буфер хэш-суммы (17 байт) │
  └──────────────────────────────────────┘*/
    getHashBuffer = (lengthBuffer, fragmentBuffer) => {
        return this.hashEngine.getHashBuffer(lengthBuffer, fragmentBuffer);
    }
    
/*┌─────────────────────────────────────────────────────────┐
  │ Обновляет состояние синхронизации для следующего пакета │
  └─────────────────────────────────────────────────────────┘*/
    syncState = (hashBuffer) => {
        this.syncEngine.syncState(hashBuffer);
    }
    
/*┌────────────────────────────────────────────────────┐
  │ Возвращает буфер ID пакета синхронизации (17 байт) │
  └────────────────────────────────────────────────────┘*/
    get syncPacketIdBuffer() {
        return this.syncEngine.syncPacketIdBuffer;
    }
    
/*┌───────────────────────────────────────────┐
  │ Возвращает буфер ID пинг-пакета (17 байт) │
  └───────────────────────────────────────────┘*/
    get pingPacketIdBuffer() {
        return this.syncEngine.pingPacketIdBuffer;
    }
    
/*┌──────────────────────────────────────────────────────┐
  │ Возвращает буфер ID пакета передачи данных (17 байт) │
  └──────────────────────────────────────────────────────┘*/
    get dataPacketIdBuffer() {
        return this.syncEngine.dataPacketIdBuffer;
    }
    
/*┌────────────────────────────┐
  │ Возвращает текущую позицию │
  └────────────────────────────┘*/
    getPosition = (type, index, offset) => {
        return this.syncEngine.getPosition(type, index, offset);
    }
    
/*┌─────────────────────────────────────────────────────────────────────┐
  │ Кодирует буфер исходного сообщения в список пакетов передачи данных │
  └─────────────────────────────────────────────────────────────────────┘*/
    encode = (messageBuffer) => {
        return this.encoderEngine.encode(messageBuffer);
    }
    
/*┌──────────────────────────────────────────────────────────┐
  │ Декодирует список фрагментов в буфер исходного сообщения │
  └──────────────────────────────────────────────────────────┘*/
    decode = (fragments) => {
        return this.decoderEngine.decode(fragments);
    }
    
/*┌────────────────────────────────────────────────┐
  │ Извлекает исходный пакет из полученного пакета │
  └────────────────────────────────────────────────┘*/
    extractPacket = (type, packetBuffer) => {
        return this.decoderEngine.extractPacket(type, packetBuffer);
    }
    
/*┌───────────────────────────────────────────┐
  │ Запускает следующий цикл отправки пакетов │
  └───────────────────────────────────────────┘*/
    runSendCycle = () => {
        this.senderEngine.runSendCycle();
    }
    
/*┌──────────────────────────────────────────────────┐
  │ Добавляет новое сообщение в очередь для отправки │
  └──────────────────────────────────────────────────┘*/
    send = (message) => {
        this.senderEngine.send(message);
    }
};
