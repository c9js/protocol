/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const EventEmitter = require('core/event-emitter/default-options');
const CryptoEngine = require('./engines/crypto-engine');   // Движок шифрования
const HashEngine = require('./engines/hash-engine');       // Движок хеширования
const SyncEngine = require('./engines/sync-engine');       // Движок синхронизации
const EncodeEngine = require('./engines/encode-engine');   // Движок кодирования
const DecodeEngine = require('./engines/decode-engine');   // Движок декодирования
const ScannerEngine = require('./engines/scanner-engine'); // Движок получения пакетов
const SenderEngine = require('./engines/sender-engine');   // Движок отправки пакетов

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
    // Создаем список движки
        [
            [ 'cryptoEngine',  CryptoEngine], // Движок шифрования
            [   'hashEngine',    HashEngine], // Движок хеширования
            [   'syncEngine',    SyncEngine], // Движок синхронизации
            [ 'encodeEngine',  EncodeEngine], // Движок кодирования
            [ 'decodeEngine',  DecodeEngine], // Движок декодирования
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
    
/*┌─────────────────────────────────────────────────┐
  │ Возвращает буфер следующего ID-пакета (17 байт) │
  └─────────────────────────────────────────────────┘*/
    getPacketIdBuffer = (keyBuffer) => {
        return this.hashEngine.getPacketIdBuffer(keyBuffer);
    }
    
/*┌─────────────────────────────────────────────────────────────────────┐
  │ Возвращает буфер дайджеста для списка следующих позиций (3016 байт) │
  └─────────────────────────────────────────────────────────────────────┘*/
    getPositionsBuffer = (keyBuffer) => {
        return this.hashEngine.getPositionsBuffer(keyBuffer);
    }
    
/*┌──────────────────────────────────────┐
  │ Возвращает буфер хэш-суммы (17 байт) │
  └──────────────────────────────────────┘*/
    getHashBuffer = (lengthBuffer, fragmentBuffer) => {
        return this.hashEngine.getHashBuffer(lengthBuffer, fragmentBuffer);
    }
    
/*┌────────────────────────────┐
  │ Возвращает буфер ID-пакета │
  └────────────────────────────┘*/
    get packetIdBuffer() {
        return this.syncEngine.packetIdBuffer;
    }
    
/*┌────────────────────────────┐
  │ Возвращает текущую позицию │
  └────────────────────────────┘*/
    getPosition = (offset) => {
        return this.syncEngine.getPosition(offset);
    }
    
/*┌─────────────────────────────────────────────────────────┐
  │ Обновляет состояние синхронизации для следующего пакета │
  └─────────────────────────────────────────────────────────┘*/
    syncState = (hashBuffer) => {
        this.syncEngine.syncState(hashBuffer);
    }
    
/*┌──────────────────────────────────────────────────┐
  │ Добавляет новое сообщение в очередь для отправки │
  └──────────────────────────────────────────────────┘*/
    addMessage = (message) => {
        this.encodeEngine.addMessage(message);
    }
};
