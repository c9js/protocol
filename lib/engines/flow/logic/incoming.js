/*▄─────────────────────────────────────────────▄
  █                                             █
  █  Создает логику обработки входящих пакетов  █
  █                                             █
  ▀─────────────────────────────────────────────▀*/
module.exports = class IncomingFlow {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌───────────────────────────────────────────┐
  │ Обрабатывает полученный пакет авторизации │
  └───────────────────────────────────────────┘*/
    handleAuthPacket = (packet, category, packetBuffer) => {
    // Пакет начала авторизации
        if (packet.packetType == 'INIT') {
        // Запускаем следующий цикл отправки пакетов подтверждения авторизации
            this.engine.outgoing.runAuthSendCycle('SIGN', packet.ORIGIN);
        }
        
    // Пакет подтверждения авторизации
        if (packet.packetType == 'SIGN') {
        // Запускаем следующий цикл отправки пакетов завершения авторизации
            this.engine.outgoing.runAuthSendCycle('DONE', packet.ORIGIN);
        }
        
    // Пакет завершения авторизации
        if (packet.packetType == 'DONE') {
        // Инициализируем завершение авторизации
            this.engine.outgoing.doneAuth(packet.HASH);
        }
    }
    
/*┌─────────────────────────────────────────────┐
  │ Обрабатывает полученный пакет синхронизации │
  └─────────────────────────────────────────────┘*/
    handleSyncPacket = (packet, category, packetBuffer) => {
    // Пакет передачи данных
        if (packet.packetType == 'DATA') {
        // Добавляем фрагмент в список фрагментов
            this.protocol.message.addFragment(packet);
        }
        
    // Запускаем следующий цикл отправки пакетов синхронизации
        this.engine.outgoing.runSyncSendCycle(packet.HASH);
    }
    
/*┌───────────────────────────────┐
  │ Обрабатывает полученный пакет │
  └───────────────────────────────┘*/
    handlePacket = (packet, category, packetBuffer) => {
    // Сообщаем о получении пакета
        this.protocol.command.data(packet, packetBuffer);
        
    // Категория пакетов авторизации
        if (category == 'AUTH') {
            this.handleAuthPacket(packet, category, packetBuffer);
        }
        
    // Категория пакетов синхронизации
        if (category == 'SYNC') {
            this.handleSyncPacket(packet, category, packetBuffer);
        }
    }
};
