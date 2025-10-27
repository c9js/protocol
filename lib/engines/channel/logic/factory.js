/*▄────────────────────────────────────────────────────────▄
  █                                                        █
  █  Создает логику инициализации выбранного канала связи  █
  █                                                        █
  ▀────────────────────────────────────────────────────────▀*/
module.exports = class FactoryChannel {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
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
    
/*┌──────────────────────────────────────┐
  │ Инициализирует выбранный канал связи │
  └──────────────────────────────────────┘*/
    initChannel = () => {
    // Получаем канал связи
        const channel = this.engine.channel;
        
    // Получаем опции канала связи
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
        
    // Привязываем список команд приемника (Protocol → Channel)
        this.bindScannerCommands(channel, scanner);
        
    // Регистрируем список сигналов приемника (Channel → Protocol)
        this.registerScannerSignals(channel, scanner);
    }
    
/*┌───────────────────────────┐
  │ Инициализирует передатчик │
  └───────────────────────────┘*/
    initSender = (channel, options) => {
    // Инициализируем передатчик
        const sender = channel.init.sender(options.sender);
        
    // Привязываем список команд передатчика (Protocol → Channel)
        this.bindSenderCommands(channel, sender);
        
    // Регистрируем список сигналов передатчика (Channel → Protocol)
        this.registerSenderSignals(channel, sender);
    }
    
/*┌──────────────────────────────────────────────────────────┐
  │ Привязывает список команд приемника (Protocol → Channel) │
  └──────────────────────────────────────────────────────────┘*/
    bindScannerCommands = (channel, scanner) => {
    // Получаем контракт со списком команд приемника
        const contract = this.protocol.contracts.commands.scanner;
        
    // Получаем список адаптеров для приема команд
        const commandAdapters = channel.scanner.commandAdapters(scanner, contract);
        
    // Привязываем список команд (Protocol → Channel)
        this.protocol.command.bindCommands(commandAdapters);
    }
    
/*┌────────────────────────────────────────────────────────────┐
  │ Привязывает список команд передатчика (Protocol → Channel) │
  └────────────────────────────────────────────────────────────┘*/
    bindSenderCommands = (channel, sender) => {
    // Получаем контракт со списком команд передатчика
        const contract = this.protocol.contracts.commands.sender;
        
    // Получаем список адаптеров для приема команд
        const commandAdapters = channel.sender.commandAdapters(sender, contract);
        
    // Привязываем список команд (Protocol → Channel)
        this.protocol.command.bindCommands(commandAdapters);
    }
    
/*┌─────────────────────────────────────────────────────────────┐
  │ Регистрирует список сигналов приемника (Channel → Protocol) │
  └─────────────────────────────────────────────────────────────┘*/
    registerScannerSignals = (channel, scanner) => {
    // Получаем контракт со списком сигналов приемника
        const contract = this.protocol.contracts.signals.scanner;
        
    // Получаем список адаптеров для передачи сигналов
        const signalAdapters = channel.scanner.signalAdapters(scanner, contract);
        
    // Получаем список портов для приема сигналов
        const signalPorts = this.protocol.port.scanner.signals(contract);
        
    // Регистрируем список сигналов (Channel → Protocol)
        this.protocol.port.registerSignals(signalAdapters, signalPorts);
    }
    
/*┌───────────────────────────────────────────────────────────────┐
  │ Регистрирует список сигналов передатчика (Channel → Protocol) │
  └───────────────────────────────────────────────────────────────┘*/
    registerSenderSignals = (channel, sender) => {
    // Получаем контракт со списком сигналов передатчика
        const contract = this.protocol.contracts.signals.sender;
        
    // Получаем список адаптеров для передачи сигналов
        const signalAdapters = channel.sender.signalAdapters(sender, contract);
        
    // Получаем список портов для приема сигналов
        const signalPorts = this.protocol.port.sender.signals(contract);
        
    // Регистрируем список сигналов (Channel → Protocol)
        this.protocol.port.registerSignals(signalAdapters, signalPorts);
    }
};
