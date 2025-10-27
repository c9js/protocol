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
    signals = (protocol, contract) => ({
    // Сообщает о получении пакета
        [contract.DATA]: (packetBuffer) => {
            protocol.io.onPacket(packetBuffer);
        },
        
    // Сообщает о запуске приемника
        [contract.START]: () => {
            protocol.emit(contract.START);
        },
        
    // Сообщает об остановке приемника
        [contract.STOP]: () => {
            protocol.emit(contract.STOP);
        },
        
    // Сообщает о перезапуске приемника
        [contract.RESTART]: (reason) => {
            protocol.emit(contract.RESTART, reason);
        },
        
    // Сообщает об ошибке приемника
        [contract.ERROR]: (error) => {
            protocol.emit(contract.ERROR, error);
        },
        
    // Сообщает об аварийном завершении приемника
        [contract.EXIT]: (code) => {
            protocol.emit(contract.EXIT, code);
        },
        
    // Сообщает о истечении времени получения пакета (приемник будет перезапущен)
        [contract.TIMEOUT]: () => {
            protocol.emit(contract.TIMEOUT);
        },
    })
};
