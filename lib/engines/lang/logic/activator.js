/*▄─────────────────────────────────────────────▄
  █                                             █
  █  Создает логику активации выбранного языка  █
  █                                             █
  ▀─────────────────────────────────────────────▀*/
module.exports = class ActivatorLang {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌──────────────────────────────────────┐
  │ Проверяет поддержку выбранного языка │
  └──────────────────────────────────────┘*/
    checkLang = (lang) => {
    // Получаем список поддерживаемых языков
        const langs = Object.keys(this.protocol.langs);
        
    // Выбранный язык не найден
        if (!langs.includes(lang)) {
            return false;
        }
        
    // Проверка прошла успешно
        return true;
    }
    
/*┌───────────────────────────┐
  │ Отправляет предупреждение │
  └───────────────────────────┘*/
    notifyLangWarn = (lang, defaultLang) => {
    // Получаем контракт предупреждения
        const { LANG_NOT_FOUND } = this.protocol.registry.notices.warn;
        
    // Отправляем предупреждение
        this.protocol.notice.reportWarn(LANG_NOT_FOUND, lang, defaultLang);
    }
    
/*┌───────────────────────────┐
  │ Активирует выбранный язык │
  └───────────────────────────┘*/
    activateLang = () => {
    // Получаем выбранный язык
        let lang = this.protocol.options.lang;
        
    // Выбранный язык не найден
        if (!this.checkLang(lang)) {
        // Отправляем предупреждение
            this.notifyLangWarn(lang, this.protocol.defaultLang);
            
        // Выбираем язык по умолчанию
            lang = this.protocol.defaultLang;
        }
        
    // Активируем выбранный язык в движке
        this.engine.lang = this.protocol.langs[lang];
    }
};
