/*▄────────────────────────────────────────────────▄
  █                                                █
  █  Создает логику списков адаптеров передатчика  █
  █                                                █
  ▀────────────────────────────────────────────────▀*/
module.exports = class SenderL2raw {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌─────────────────────────────────────────────────────────┐
  │ Список адаптеров для приема команд (Protocol → Channel) │
  └─────────────────────────────────────────────────────────┘*/
    commandAdapters = (sender, contract) => ({
    // Обновляет буфер пакета для следующей отправки
        [contract.UPDATE_PACKET]: (packetBuffer) => {
            sender.update(packetBuffer);
        },
    })
    
/*┌─────────────────────────────────────────────────────────────┐
  │ Список адаптеров для передачи сигналов (Channel → Protocol) │
  └─────────────────────────────────────────────────────────────┘*/
    signalAdapters = (sender, {
          START, // Сигнал запуска передатчика
           STOP, // Сигнал остановки передатчика
        RESTART, // Сигнал перезапуска передатчика
          ERROR, // Сигнал ошибок передатчика
           EXIT, // Сигнал аварийного завершения передатчика
        TIMEOUT, // Сигнал таймаута передатчика
    }) => ({
          [START]: (handler) => sender.on('start', handler),
           [STOP]: (handler) => sender.on('stop', handler),
        [RESTART]: (handler) => sender.on('restart', handler),
          [ERROR]: (handler) => sender.on('error', handler),
           [EXIT]: (handler) => sender.on('exit', handler),
        [TIMEOUT]: (handler) => sender.on('timeout', handler),
    })
};
