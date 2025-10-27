/*▄────────────────────────────────────▄
  █                                    █
  █  Создает роль адаптации приемника  █
  █                                    █
  ▀────────────────────────────────────▀*/
module.exports = class ScannerL2raw {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(role) {
    // Инициализируем роль
        role(this);
    }
    
/*┌─────────────────────────────────────────────────────────┐
  │ Список адаптеров для приема команд (Protocol → Channel) │
  └─────────────────────────────────────────────────────────┘*/
    commandAdapters = (scanner, contract) => ({
    })
    
/*┌─────────────────────────────────────────────────────────────┐
  │ Список адаптеров для передачи сигналов (Channel → Protocol) │
  └─────────────────────────────────────────────────────────────┘*/
    signalAdapters = (scanner, {
           DATA, // Сигнал получения пакетов
          START, // Сигнал запуска приемника
           STOP, // Сигнал остановки приемника
        RESTART, // Сигнал перезапуска приемника
          ERROR, // Сигнал ошибок приемника
           EXIT, // Сигнал аварийного завершения приемника
        TIMEOUT, // Сигнал таймаута приемника
    }) => ({
           [DATA]: (handler) => scanner.on('data', handler),
          [START]: (handler) => scanner.on('start', handler),
           [STOP]: (handler) => scanner.on('stop', handler),
        [RESTART]: (handler) => scanner.on('restart', handler),
          [ERROR]: (handler) => scanner.on('error', handler),
           [EXIT]: (handler) => scanner.on('exit', handler),
        [TIMEOUT]: (handler) => scanner.on('timeout', handler),
    })
};
