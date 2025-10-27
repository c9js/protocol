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
    
/*┌─────────────────────────────────────────────┐
  │ Проверяет поддержку выбранного канала связи │
  └─────────────────────────────────────────────┘*/
    checkChannel = (channel) => {
    // Получаем список поддерживаемых каналов связи
        const channels = this.engine.channels;
        
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
    
/*┌─────────────────────────────────┐
  │ Загружает выбранный канал связи │
  └─────────────────────────────────┘*/
    loadChannel = (loader) => {
    // Получаем опции канала связи
        const options = this.protocol.options.channel || {};
        
    // Получаем имя канала связи
        const channel = options.name || this.protocol.defaultChannel;
        
    // Канал связи не найден
        if (!this.checkChannel(channel)) {
        // Отправляем сообщение об ошибке
            this.notifyChannelError(channel);
        }
        
    // Получаем список ролей канала связи
        const channelRoles = this.engine.factory.getChannelRoles();
        
    // Загружаем канал связи
        loader[channel](...channelRoles);
        
    // Сохраняем ссылку на канал связи
        this.engine.channel = this.engine[channel];
    }
};
