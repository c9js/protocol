/*▄─────────────────────────────────────────────▄
  █                                             █
  █  Создает логику инициализации канала связи  █
  █                                             █
  ▀─────────────────────────────────────────────▀*/
module.exports = class FactoryChannel {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
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
        this.initScanner(channel, options);
        
    // Инициализируем передатчик
        this.initSender(channel, options);
    }
    
/*┌─────────────────────────┐
  │ Инициализирует приемник │
  └─────────────────────────┘*/
    initScanner = (channel, options) => {
    // Инициализируем приемник
        const scanner = channel.init.scanner(options.scanner);
        
    // Получаем контракт методов приемника
        const methods = this.protocol.contracts.methods.scanner;
        
    // Регистрируем методы приемника
        this.registerMethods(
            channel.iScanner.methods(scanner, methods)
        );
        
    // Получаем контракт событий приемника
        const events = this.protocol.contracts.events.scanner;
        
    // Получаем интерфейс обработчиков протокола
        const iEvents = this.protocol.event.interfaces.iScanner.events(this.protocol, events);
        
    // Получаем интерфейс обработчиков канала связи
        const iChannel = channel.iScanner.events(scanner, events);
        
    // Регистрируем события приемника
        this.registerEvents(iEvents, iChannel);
    }
    
/*┌───────────────────────────┐
  │ Инициализирует передатчик │
  └───────────────────────────┘*/
    initSender = (channel, options) => {
    // Инициализируем передатчик
        const sender = channel.init.sender(options.sender);
        
    // Получаем контракт методов передатчика
        const methods = this.protocol.contracts.methods.sender;
        
    // Регистрируем методы передатчика
        this.registerMethods(
            channel.iSender.methods(sender, methods)
        );
        
    // Получаем контракт событий передатчика
        const events = this.protocol.contracts.events.sender;
        
    // Получаем интерфейс обработчиков протокола
        const iEvents = this.protocol.event.interfaces.iSender.events(this.protocol, events);
        
    // Получаем интерфейс обработчиков канала связи
        const iChannel = channel.iSender.events(sender, events);
        
    // Регистрируем события передатчика
        this.registerEvents(iEvents, iChannel);
    }
    
/*┌─────────────────────────────┐
  │ Регистрирует список методов │
  └─────────────────────────────┘*/
    registerMethods = (methods) => {
    // Проходим по списку методов
        for (const [name, method] of Object.entries(methods)) {
            this.protocol.event.on(name, method);
        }
    }
    
/*┌────────────────────────────────────┐
  │ Инициализирует список обработчиков │
  └────────────────────────────────────┘*/
    registerEvents = (iEvents, iChannel) => {
    // Проходим по списку обработчиков
        for (const [contract, handler] of Object.entries(iEvents)) {
            iChannel[contract](handler);
        }
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
};
