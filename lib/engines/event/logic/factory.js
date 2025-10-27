/*▄────────────────────────────────────────▄
  █                                        █
  █  Создает логику инициализации событий  █
  █                                        █
  ▀────────────────────────────────────────▀*/
module.exports = class FactoryEvent {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌───────────────────────────────┐
  │ Инициализирует список событий │
  └───────────────────────────────┘*/
    initEvents = () => {
        // _=this.protocol.contracts.events.scanner
        // _=this.protocol.contracts.events.sender
        // _=this.protocol.contracts.methods.sender
    }
};
