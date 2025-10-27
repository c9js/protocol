/*▄───────────────────────────────▄
  █                               █
  █  Создает интерфейс приемника  █
  █                               █
  ▀───────────────────────────────▀*/
module.exports = class iScannerL2raw {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(iface) {
    // Инициализируем интерфейс
        iface(this);
    }
    
/*┌──────────────────┐
  │ Методы приемника │
  └──────────────────┘*/
    methods = (scanner, contract) => ({
    })
    
/*┌───────────────────┐
  │ События приемника │
  └───────────────────┘*/
    events = (scanner, {
           DATA, // Обработчик получения пакетов
          START, // Обработчик запуска приемника
           STOP, // Обработчик остановки приемника
        RESTART, // Обработчик перезапуска приемника
          ERROR, // Обработчик ошибок приемника
           EXIT, // Обработчик аварийного завершения приемника
        TIMEOUT, // Обработчик таймаута приемника
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
