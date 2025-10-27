/*▄───────────────────────────────────▄
  █                                   █
  █  Создает список команд приемника  █
  █                                   █
  ▀───────────────────────────────────▀*/
module.exports = class ScannerCommands {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(commands) {
    // Инициализируем список команд
        commands(this);
        
    // Получаем контракт со списком команд приемника
        this.contract = this.protocol.registry.commands.scanner;
    }
};
