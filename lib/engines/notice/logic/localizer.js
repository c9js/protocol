/*▄──────────────────────────────────────────▄
  █                                          █
  █  Создает логику локализации уведомлений  █
  █                                          █
  ▀──────────────────────────────────────────▀*/
module.exports = class LocalizerNotice {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌─────────────────────────────┐
  │ Проверяет наличие контракта │
  └─────────────────────────────┘*/
    checkContract = (role, contract) => {
    // Получаем список ролей
        const roles = this.protocol.registry.notices;
        
    // Контракт не найден
        if (!roles[role][contract]) {
            return false;
        }
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌──────────────────────────────────┐
  │ Возвращает локализатор контракта │
  └──────────────────────────────────┘*/
    getLocalizer = (role, contract) => {
    // Движок языков не найден
        if (!this.protocol.lang) {
            return null;
        }
        
    // Получаем список ролей
        const roles = this.protocol.registry.notices;
        
    // Получаем локализатор контракта
        const localizer = this.protocol.lang.getLocalizer(roles, role, contract);
        
    // Локализатор не найден
        if (!localizer) {
            return null;
        }
        
    // Возвращаем локализатор контракта
        return localizer;
    }
    
/*┌───────────────────────────────────────┐
  │ Возвращает локализованное уведомление │
  └───────────────────────────────────────┘*/
    getLocalizedNotice = (role, contract, args) => {
    // Контракт не найден
        if (!this.checkContract(role, contract)) {
        // Возвращаем уведомление "Контракт не найден" без локализации
            return this.engine.formatter.formatFallbackContractNotFound(contract, args);
        }
        
    // Получаем локализатор контракта
        const localizer = this.getLocalizer(role, contract);
        
    // Локализатор не найден
        if (!localizer) {
        // Возвращаем уведомление без локализации
            return this.engine.formatter.formatFallbackNotice(contract, args);
        }
        
    // Получаем локализованное уведомление
        const localizedNotice = localizer(...args);
        
    // Возвращаем локализованное уведомление
        return [contract, localizedNotice];
    }
};
