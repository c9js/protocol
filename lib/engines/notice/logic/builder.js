/*▄───────────────────────────────────────▄
  █                                       █
  █  Создает логику создания уведомлений  █
  █                                       █
  ▀───────────────────────────────────────▀*/
module.exports = class BuilderNotice {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌─────────────────────────────────────┐
  │ Возвращает стек вызовов уведомления │
  └─────────────────────────────────────┘*/
    getStackNotice = (callMethod) => {
    // Создаем вспомогательную ошибку для получения стека
        const error = new Error();
        
    // Удаляем имя
        error.name = '';
        
    // Обрезаем внутренние вызовы
        Error.captureStackTrace(error, this.engine[callMethod]);
        
    // Возвращаем стек вызовов уведомления
        return error.stack;
    }
    
/*┌─────────────────────────────┐
  │ Создает причину уведомления │
  └─────────────────────────────┘*/
    createReasonNotice = (callMethod, code, notice) => {
    // Создаем причину
        const reason = new Error();
        
    // Добавляем имя
        reason.name = callMethod;
        
    // Переводим первый символ имени в верхний регистр
        reason.name = reason.name[0].toUpperCase() + reason.name.slice(1);
        
    // Добавляем код
        reason.code = code;
        
    // Добавляем подробный список
        reason.details = Array.isArray(notice) ? notice : [notice];
        
    // Добавляем сообщение
        reason.message = [reason.code, ...reason.details].join('\n');
        
    // Добавляем стек вызовов
        reason.stack = this.getStackNotice(callMethod);
        
    // Возвращаем причину уведомления
        return reason;
    }
};
