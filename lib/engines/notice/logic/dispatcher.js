/*▄───────────────────────────────────────▄
  █                                       █
  █  Создает логику отправки уведомлений  █
  █                                       █
  ▀───────────────────────────────────────▀*/
module.exports = class DispatcherNotice {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌────────────────────────┐
  │ Отправляет уведомление │
  └────────────────────────┘*/
    sendNotice = (callMethod, role, contract, args) => {
    // Получаем локализованное уведомление
        const [code, notice] = this.engine.localizer.getLocalizedNotice(role, contract, args);
        
    // Создаем причину уведомления
        const reason = this.engine.builder.createReasonNotice(callMethod, code, notice);
        
    // Ошибка во время инициализации
        if (callMethod == 'initError') {
        // Останавливаем инициализацию протокола
            throw reason;
        }
        
    // Сообщаем о получении уведомления
        this.protocol.command[role](reason);
    }
    
/*┌─────────────────────────────────────┐
  │ Отправляет информационное сообщение │
  └─────────────────────────────────────┘*/
    reportInfo = (contract, ...args) => process.nextTick(() => {
        this.sendNotice('reportInfo', 'info', contract, args);
    })
    
/*┌───────────────────────────┐
  │ Отправляет предупреждение │
  └───────────────────────────┘*/
    reportWarn = (contract, ...args) => process.nextTick(() => {
        this.sendNotice('reportWarn', 'warn', contract, args);
    })
    
/*┌────────────────────────────────┐
  │ Отправляет сообщение об ошибке │
  └────────────────────────────────┘*/
    reportError = (contract, ...args) => process.nextTick(() => {
        this.sendNotice('reportError', 'error', contract, args);
    })
    
/*┌───────────────────────────────────────────────────────┐
  │ Отправляет сообщение об ошибке во время инициализации │
  └───────────────────────────────────────────────────────┘*/
    initError = (contract, ...args) => {
        this.sendNotice('initError', 'error', contract, args);
    }
};
