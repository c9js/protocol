/*▄───────────────────────────────▄
  █                               █
  █  Создает интерфейс приемника  █
  █                               █
  ▀───────────────────────────────▀*/
module.exports = class iScannerEvent {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(iface) {
    // Инициализируем интерфейс
        iface(this);
    }
    
/*┌───────────────────┐
  │ События приемника │
  └───────────────────┘*/
    events = (protocol, contract) => ({
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
