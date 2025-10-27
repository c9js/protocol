/*▄─────────────────────────────────────────────────────▄
  █                                                     █
  █  Создает логику инициализации списка локализаторов  █
  █                                                     █
  ▀─────────────────────────────────────────────────────▀*/
module.exports = class FactoryLang {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌──────────────────────────────────┐
  │ Возвращает локализатор контракта │
  └──────────────────────────────────┘*/
    getLocalizer = (roles, role, contract) => {
    // Получаем список локализаций
        const localizations = this.getLocalizations(roles, role);
        
    // Список локализаторов не найден
        if (!localizations[role]) {
            return null;
        }
        
    // Возвращаем локализатор контракта
        return localizations[role][contract];
    }
    
/*┌───────────────────────────────┐
  │ Возвращает список локализаций │
  └───────────────────────────────┘*/
    getLocalizations = (roles, role) => {
    // Инициализируем список локализаций
        if (!this.engine.localizations) {
            this.engine.localizations = {};
        }
        
    // Инициализируем список локализаторов
        if (!this.engine.localizations[role]) {
            this.initLocalizers(roles);
        }
        
    // Возвращаем список локализаций
        return this.engine.localizations;
    }
    
/*┌─────────────────────────────────────┐
  │ Инициализирует список локализаторов │
  └─────────────────────────────────────┘*/
    initLocalizers = (roles) => {
    // Получаем выбранный язык
        const lang = this.engine.lang;
        
    // Проходим по списку ролей
        Object.keys(roles).forEach((role) => {
        // Инициализируем локализацию в движке
            this.engine.localizations[role] = {};
            
        // Получаем список контрактов
            const contracts = roles[role];
            
        // Получаем локализатор роли
            const roleLocalizer = lang[role];
            
        // Локализатор роли не найдена
            if (!roleLocalizer) return;
            
        // Получаем список локализаторов
            const localizers = roleLocalizer(contracts);
            
        // Проходим по списку локализаторов
            for (const [contract, localizer] of Object.entries(localizers)) {
            // Инициализируем локализатор в локализации
                this.engine.localizations[role][contract] = localizer;
            }
        });
    }
};
