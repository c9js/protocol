/*▄───────────────────────────────────▄
  █                                   █
  █  Создает список портов приемника  █
  █                                   █
  ▀───────────────────────────────────▀*/
module.exports = class ScannerPorts {
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
    // Сообщает о получении пакета
        [signals.DATA]: (packetBuffer) => {
            protocol.io.onPacket(packetBuffer);
        },
        
    // Сообщает о запуске приемника
        [signals.START]: () => {
            protocol.emit(signals.START);
        },
        
    // Сообщает об остановке приемника
        [signals.STOP]: () => {
            protocol.emit(signals.STOP);
        },
        
    // Сообщает о перезапуске приемника
        [signals.RESTART]: (reason) => {
            protocol.emit(signals.RESTART, reason);
        },
        
    // Сообщает об ошибке приемника
        [signals.ERROR]: (error) => {
            protocol.emit(signals.ERROR, error);
        },
        
    // Сообщает об аварийном завершении приемника
        [signals.EXIT]: (code) => {
            protocol.emit(signals.EXIT, code);
        },
        
    // Сообщает о истечении времени получения пакета (приемник будет перезапущен)
        [signals.TIMEOUT]: () => {
            protocol.emit(signals.TIMEOUT);
        },
    })
};
