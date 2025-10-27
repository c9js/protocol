/*▄────────────────────────────────────────────▄
  █                                            █
  █  Создает логику загрузки выбранного языка  █
  █                                            █
  ▀────────────────────────────────────────────▀*/
module.exports = class LoaderLang {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌──────────────────────────┐
  │ Проверяет выбранный язык │
  └──────────────────────────┘*/
    validateLang = (lang) => {
    // Получаем список поддерживаемых языков
        const langs = this.engine.langs;
        
    // Выбранный язык не найден
        if (!langs.includes(lang)) {
        // Получаем контракт ошибки
            const { LANG_NOT_FOUND } = this.protocol.contracts.errors;
            
        // Сообщаем об ошибке
            throw [LANG_NOT_FOUND, lang];
        }
    }
    
/*┌──────────────────────────┐
  │ Загружает выбранный язык │
  └──────────────────────────┘*/
    loadLang = (loader) => {
    // Получаем выбранный язык
        const lang = this.protocol.options.lang;
        
    // Проверяем выбранный язык
        this.validateLang(lang);
        
    // Получаем список локализаций
        const localizations = this.engine.localizations;
        
    // Загружаем выбранный язык
        loader[lang](...localizations);
    }
};
