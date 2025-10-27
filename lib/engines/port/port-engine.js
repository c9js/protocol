/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const EventEmitter = require('events');

/*▄─────────────────────────▄
  █                         █
  █  Создает движок портов  █
  █                         █
  ▀─────────────────────────▀*/
module.exports = class PortEngine extends EventEmitter {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(engine) {
    // Вызываем конструктор родителя
        super();
        
    // Инициализируем движок
        engine(this);
        
    // Инициализируем список логических единиц
        engine.logic(
            'registrar', // Логика регистрации списка сигналов (Channel → Protocol)
        );
        
    // Инициализируем списки портов
        engine.ports(
            'scanner', // Список портов приемника
             'sender', // Список портов передатчика
        );
    }
    
/*┌───────────────────────────────────────────────────┐
  │ Регистрирует список сигналов (Channel → Protocol) │
  └───────────────────────────────────────────────────┘*/
    registerSignals = (signalAdapters, signalPorts) => {
        this.registrar.registerSignals(signalAdapters, signalPorts);
    }
};
