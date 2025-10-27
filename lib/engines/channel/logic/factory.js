/*▄────────────────────▄
  █                    █
  █  Загрузка модулей  █
  █                    █
  ▀────────────────────▀*/
const EventEmitter = require('events');

/*▄─────────────────────────────────────────────▄
  █                                             █
  █  Создает логику инициализации канала связи  █
  █                                             █
  ▀─────────────────────────────────────────────▀*/
module.exports = class FactoryChannel extends EventEmitter {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Вызываем конструктор родителя
        super();
        
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌───────────────────────────────────────────────┐
  │ Обновляет буфер пакета для следующей отправки │
  └───────────────────────────────────────────────┘*/
    update = (packetBuffer) => {
        this.emit('update', packetBuffer);
    }
    
/*┌───────────────────────────────┐
  │ Инициализирует список методов │
  └───────────────────────────────┘*/
    initMethods = (endpoint, methods) => {
        methods.forEach(method => this.on(method, endpoint[method]));
    }
    
/*┌────────────────────────────────────┐
  │ Инициализирует список обработчиков │
  └────────────────────────────────────┘*/
    initHandlers = (endpoint, handlers, events) => {
        events.forEach(event => endpoint.on(event, handlers[event]));
    }
    
/*┌────────────────────────┐
  │ Возвращает канал связи │
  └────────────────────────┘*/
    getChannel = () => {
    // Получаем опции канала связи
        const options = this.protocol.options.channel || {};
        
    // Получаем имя канала связи
        const name = options.name || this.protocol.defaultChannel;
        
    // Получаем канал связи
        const channel = this.engine[name];
        
    // Проверяем наличие канала связи
        if (!channel) {
            throw new Error(
                `Канал связи "${name}" не найден!`
            );
        }
        
    // Возвращает канал связи
        return channel;
    }
    
/*┌───────────────────────────────┐
  │ Возвращает опции канала связи │
  └───────────────────────────────┘*/
    getOptions = (defaultOptions = {}) => {
    // Получаем опции канала связи
        const options = this.protocol.options.channel || {};
        
    // Разделяем опции канала связи
        const {
            scanner = {}, // Опции приемника
             sender = {}, // Опции передатчика
            ...shared     // Общие опции
        } = options;
        
    // Удаляем имя канала связи из опций
        delete shared.name;
        
    // Получаем опции приемника по умолчанию
        const defaultScanner = defaultOptions.scanner || {};
        
    // Получаем опции передатчика по умолчанию
        const defaultSender = defaultOptions.sender || {};
        
    // Возвращаем опции канала связи
        return {
        // Опции приемника
            scanner: {
                ...defaultScanner, // Опции приемника по умолчанию
                        ...shared, // Общие опции
                       ...scanner, // Опции приемника
            },
            
        // Опции передатчика
            sender: {
                ...defaultSender, // Опции передатчика по умолчанию
                       ...shared, // Общие опции
                       ...sender, // Опции передатчика
            },
        };
    }
    
/*┌────────────────────────────┐
  │ Инициализирует канал связи │
  └────────────────────────────┘*/
    initChannel = () => {
    // Получаем канал связи
        const channel = this.getChannel();
        
    // Получаем опции канал связи
        const options = this.getOptions(channel.defaultOptions);
        
    // Инициализируем приемник
        channel.initScanner(this, options.scanner, this.protocol.event.scanner);
        
    // Инициализируем передатчик
        channel.initSender(this, options.sender, this.protocol.event.sender);
    }
};
