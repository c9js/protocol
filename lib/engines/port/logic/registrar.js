/*▄───────────────────────────────────────────────────────────────────▄
  █                                                                   █
  █  Создает логику регистрации списка сигналов (Channel → Protocol)  █
  █                                                                   █
  ▀───────────────────────────────────────────────────────────────────▀*/
module.exports = class RegistrarPort {
/*┌─────────────┐
  │ Конструктор │
  └─────────────┘*/
    constructor(logic) {
    // Инициализируем логическую единицу
        logic(this);
    }
    
/*┌───────────────────────────────────────────────────┐
  │ Регистрирует список сигналов (Channel → Protocol) │
  └───────────────────────────────────────────────────┘*/
    registerSignals = (signalAdapters, signalPorts) => {
    // Проходим по списку адаптеров
        for (const [signal, registerSignal] of Object.entries(signalAdapters)) {
        // Регистрируем сигнал
            registerSignal(signalPorts[signal]);
        }
    }
};
