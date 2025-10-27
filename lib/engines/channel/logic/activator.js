/*▄────────────────────────────────────────────────────▄
  █                                                    █
  █  Создает логику активации выбранного канала связи  █
  █                                                    █
  ▀────────────────────────────────────────────────────▀*/
module.exports = class ActivatorChannel {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌─────────────────────────────────────────────┐
  │ Проверяет поддержку выбранного канала связи │
  └─────────────────────────────────────────────┘*/
    checkChannel = (channel) => {
    // Получаем список поддерживаемых каналов связи
        const channels = Object.keys(this.protocol.channels);
        
    // Канал связи не найден
        if (!channels.includes(channel)) {
            return false;
        }
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌────────────────────────────────┐
  │ Отправляет сообщение об ошибке │
  └────────────────────────────────┘*/
    notifyChannelError = (channel) => {
    // Получаем контракт ошибки
        const { CHANNEL_NOT_FOUND } = this.protocol.registry.notices.error;
        
    // Отправляем сообщение об ошибке во время инициализации
        this.protocol.notice.initError(CHANNEL_NOT_FOUND, channel);
    }
    
/*┌──────────────────────────────────┐
  │ Активирует выбранный канал связи │
  └──────────────────────────────────┘*/
    activateChannel = () => {
    // Получаем опции канала связи
        const options = this.protocol.options.channel || {};
        
    // Получаем имя канала связи
        const channel = options.name || this.protocol.defaultChannel;
        
    // Канал связи не найден
        if (!this.checkChannel(channel)) {
        // Отправляем сообщение об ошибке
            this.notifyChannelError(channel);
        }
        
    // Активируем выбранный канал связи в движке
        this.engine.channel = this.protocol.channels[channel];
    }
};
