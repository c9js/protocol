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
    
/*┌────────────────────────────┐
  │ Инициализирует канал связи │
  └────────────────────────────┘*/
    initChannel = () => {
    // Получаем опции канала связи
        let options = this.protocol.options.channel;
        
    // Проверяем опции канала связи
        if (!options) {
        // Добавляем имя канала связи по умолчанию
            options = { name: this.protocol.defaultChannel };
        }
        
    // Получаем канал связи
        const channel = this.engine[options.name];
        
    // Проверяем наличие канала связи
        if (!channel) {
            throw new Error(
                `Канал связи "${options.name}" не найден!`
            );
        }
        
    // Удаляем имя канала связи из опций
        delete options.name;
        
    // Обновляем опции с учетом значений по умолчанию
        options = { ...channel.defaultOptions, ...options };
        
    // Инициализируем приемник
        channel.initScanner(options, this.protocol.io.onPacket);
        
    // Инициализируем передатчик
        channel.initSender(this, options);
    }
};
