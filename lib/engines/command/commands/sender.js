/*▄─────────────────────────────────────▄
  █                                     █
  █  Создает список команд передатчика  █
  █                                     █
  ▀─────────────────────────────────────▀*/
module.exports = class SenderCommands {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(commands) {
    // Инициализируем список команд
        commands(this);
        
    // Получаем контракт со списком команд передатчика
        this.contract = this.protocol.registry.commands.sender;
    }
    
/*┌───────────────────────────────────────────────┐
  │ Обновляет буфер пакета для следующей отправки │
  └───────────────────────────────────────────────┘*/
    updatePacketBuffer = (packetBuffer) => {
    // Отправляем команду передатчику (Protocol → Channel)
        this.engine.emit(this.contract.UPDATE_PACKET, packetBuffer);
    }
};
