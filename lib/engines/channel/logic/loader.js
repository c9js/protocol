/*▄───────────────────────────────────────────────────▄
  █                                                   █
  █  Создает логику загрузки выбранного канала связи  █
  █                                                   █
  ▀───────────────────────────────────────────────────▀*/
module.exports = class LoaderChannel {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌─────────────────────────────────┐
  │ Проверяет выбранный канал связи │
  └─────────────────────────────────┘*/
    validateChannel = (channel) => {
    // Получаем список поддерживаемых каналов связи
        const channels = this.engine.channels;
        
    // Канал связи не найден
        if (!channels.includes(channel)) {
        // Получаем контракт ошибки
            const { CHANNEL_NOT_FOUND } = this.protocol.contracts.errors;
            
        // Сообщаем об ошибке
            throw [CHANNEL_NOT_FOUND, channel];
        }
    }
    
/*┌─────────────────────────────────┐
  │ Загружает выбранный канал связи │
  └─────────────────────────────────┘*/
    loadChannel = (loader) => {
    // Получаем опции канала связи
        const options = this.protocol.options.channel || {};
        
    // Получаем имя канала связи
        const channel = options.name || this.protocol.defaultChannel;
        
    // Проверяем выбранный канал связи
        this.validateChannel(channel);
        
    // Получаем список ролей канала связи
        const roles = this.engine.roles;
        
    // Загружаем канал связи
        loader[channel](...roles);
        
    // Сохраняем ссылку на канал связи
        this.engine.channel = this.engine[channel];
    }
};
