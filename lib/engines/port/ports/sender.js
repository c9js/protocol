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
    signals = (protocol, contract) => ({
    // Сообщает о запуске передатчика
        [contract.START]: () => {
            protocol.emit(contract.START);
        },
        
    // Сообщает об остановке передатчика
        [contract.STOP]: () => {
            protocol.emit(contract.STOP);
        },
        
    // Сообщает о перезапуске передатчика
        [contract.RESTART]: (reason) => {
            protocol.emit(contract.RESTART, reason);
        },
        
    // Сообщает об ошибке передатчика
        [contract.ERROR]: (error) => {
            protocol.emit(contract.ERROR, error);
        },
        
    // Сообщает об аварийном завершении передатчика
        [contract.EXIT]: (code) => {
            protocol.emit(contract.EXIT, code);
        },
        
    // Сообщает о истечении времени отправки пакета (передатчик будет перезапущен)
        [contract.TIMEOUT]: () => {
            protocol.emit(contract.TIMEOUT);
        },
    })
};
