/*▄──────────────────────────────────────────────▄
  █                                              █
  █  Создает логику обработки исходящих пакетов  █
  █                                              █
  ▀──────────────────────────────────────────────▀*/
module.exports = class OutgoingFlow {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌───────────────────────────────────┐
  │ Инициализирует начало авторизации │
  └───────────────────────────────────┘*/
    initAuth = () => {
    // Инициализируем начальное состояние
        this.protocol.state.initState();
        
    // Запускаем следующий цикл отправки пакетов начала авторизации
        this.runAuthSendCycle('INIT');
    }
    
/*┌───────────────────────────────────────┐
  │ Инициализирует завершение авторизации │
  └───────────────────────────────────────┘*/
    doneAuth = (hashBuffer) => {
    // Очищаем очередь для отправки сообщений
        this.protocol.message.clearPending();
        
    // Сообщаем о готовности соединения
        this.protocol.command.ready();
        
    // Запускаем следующий цикл отправки пакетов синхронизации
        this.runSyncSendCycle(hashBuffer);
    }
    
/*┌───────────────────────────────────────────────────────┐
  │ Запускает следующий цикл отправки пакетов авторизации │
  └───────────────────────────────────────────────────────┘*/
    runAuthSendCycle = (packetType, targetBuffer) => {
    // Создаем исходный пакет отправки для категории пакетов авторизации
        const packet = this.protocol.packet.createAuthPacket(packetType, targetBuffer);
        
    // Пакет завершения авторизации
        if (packet.packetType == 'DONE') {
        // Сообщаем о готовности соединения
            this.protocol.command.ready();
            
        // Обновляем состояние для категории пакетов синхронизации
            this.protocol.state.updateState('SYNC', packet.HASH);
        }
        
    // Обновляем буфер пакета для следующей отправки
        this.protocol.io.updatePacketBuffer(packet.packetBuffer);
    }
    
/*┌─────────────────────────────────────────────────────────┐
  │ Запускает следующий цикл отправки пакетов синхронизации │
  └─────────────────────────────────────────────────────────┘*/
    runSyncSendCycle = (hashBuffer) => {
    // Инициализируем категорию пакета
        const category = 'SYNC';
        
    // Завершаем процесс доставки последнего отправленного сообщения
        this.protocol.message.completeMessageDelivery();
        
    // Обновляем состояние для категории пакетов синхронизации
        this.protocol.state.updateState(category, hashBuffer);
        
    // Создаем исходный пакет отправки для категории пакетов синхронизации
        const packet = this.protocol.packet.createSyncPacket();
        
    // Обновляем состояние для категории пакетов синхронизации
        this.protocol.state.updateState(category, packet.HASH);
        
    // Обновляем буфер пакета для следующей отправки
        this.protocol.io.updatePacketBuffer(packet.packetBuffer);
    }
};
