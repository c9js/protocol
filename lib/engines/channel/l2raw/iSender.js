/*▄─────────────────────────────────▄
  █                                 █
  █  Создает интерфейс передатчика  █
  █                                 █
  ▀─────────────────────────────────▀*/
module.exports = class iSenderL2raw {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(iface) {
    // Инициализируем интерфейс
        iface(this);
    }
    
/*┌────────────────────┐
  │ Методы передатчика │
  └────────────────────┘*/
    methods = (sender, contract) => ({
    // Обновляет буфер пакета для следующей отправки
        [contract.UPDATE_PACKET]: (packetBuffer) => {
            sender.update(packetBuffer);
        },
    })
    
/*┌─────────────────────┐
  │ События передатчика │
  └─────────────────────┘*/
    events = (sender, {
          START, // Обработчик запуска передатчика
           STOP, // Обработчик остановки передатчика
        RESTART, // Обработчик перезапуска передатчика
          ERROR, // Обработчик ошибок передатчика
           EXIT, // Обработчик аварийного завершения передатчика
        TIMEOUT, // Обработчик таймаута передатчика
    }) => ({
          [START]: (handler) => sender.on('start', handler),
          [STOP]: (handler) => sender.on('stop', handler),
        [RESTART]: (handler) => sender.on('restart', handler),
          [ERROR]: (handler) => sender.on('error', handler),
          [EXIT]: (handler) => sender.on('exit', handler),
        [TIMEOUT]: (handler) => sender.on('timeout', handler),
    })
};
