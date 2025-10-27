/*▄─────────────────────────────────────────────────▄
  █                                                 █
  █  Создает логику инициализации выбранного языка  █
  █                                                 █
  ▀─────────────────────────────────────────────────▀*/
module.exports = class FactoryLang {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌─────────────────────────────────────────────┐
  │ Инициализирует локализации выбранного языка │
  └─────────────────────────────────────────────┘*/
    initLocalizations = () => {
    // Получаем выбранный язык
        const lang = this.protocol.options.lang;
        
    // Получаем список локализаций
        const localizations = this.engine.localizations;
        
    // Проходим по списку локализаций
        localizations.forEach((localization) => {
        // Инициализируем локализацию в движке
            this.engine[localization] = {};
            
        // Получаем контракт локализации
            const contract = this.protocol.contracts[localization];
            
        // Получаем локализацию в выбранном языке
            const localize = this.engine[lang][localization];
            
        // Получаем список локализаторов
            const localizers = localize.getLocalizers(contract);
            
        // Проходим по списку локализаторов
            for (const [localizer, handler] of Object.entries(localizers)) {
            // Инициализируем локализатор в локализации
                this.engine[localization][localizer] = handler;
            }
        });
    }
};
