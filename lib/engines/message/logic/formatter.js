/*▄───────────────────────────────────────────▄
  █                                           █
  █  Создает логику выбора формата сообщений  █
  █                                           █
  ▀───────────────────────────────────────────▀*/
module.exports = class FormatterMessage {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌──────────────────────────────────────┐
  │ Переводит буфер в исходное сообщение │
  └──────────────────────────────────────┘*/
    toMessage = (messageBuffer) => {
    // Получаем формат сообщения
        const messageFormat = this.protocol.options.messageFormat;
        
    // Переводим буфер в строку
        if (messageFormat == 'string') {
            return messageBuffer.toString();
        }
        
    // Возвращаем буфер исходного сообщения
        return messageBuffer;
    }
    
/*┌──────────────────────────────────────┐
  │ Переводит исходное сообщение в буфер │
  └──────────────────────────────────────┘*/
    toBuffer = (message) => {
    // Получаем формат сообщения
        const messageFormat = this.protocol.options.messageFormat;
        
    // Переводим строку в буфер
        if (messageFormat == 'string') {
            return Buffer.from(message);
        }
        
    // Возвращаем буфер исходного сообщения
        return message;
    }
};
