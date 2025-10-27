/*▄─────────────────────────────────────▄
  █                                     █
  █  Создает список портов передатчика  █
  █                                     █
  ▀─────────────────────────────────────▀*/
module.exports = class SenderPorts {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(ports) {
    // Инициализируем список портов
        ports(this);
    }
    
/*┌────────────────────────────────────────────────────────┐
  │ Список портов для приема сигналов (Channel → Protocol) │
  └────────────────────────────────────────────────────────┘*/
    signals = (protocol, signals) => ({
    // Сообщает о запуске передатчика
        [signals.START]: () => {
            protocol.emit(signals.START);
        },
        
    // Сообщает об остановке передатчика
        [signals.STOP]: () => {
            protocol.emit(signals.STOP);
        },
        
    // Сообщает о перезапуске передатчика
        [signals.RESTART]: (reason) => {
            protocol.emit(signals.RESTART, reason);
        },
        
    // Сообщает об ошибке передатчика
        [signals.ERROR]: (error) => {
            protocol.emit(signals.ERROR, error);
        },
        
    // Сообщает об аварийном завершении передатчика
        [signals.EXIT]: (code) => {
            protocol.emit(signals.EXIT, code);
        },
        
    // Сообщает о истечении времени отправки пакета (передатчик будет перезапущен)
        [signals.TIMEOUT]: () => {
            protocol.emit(signals.TIMEOUT);
        },
    })
};
