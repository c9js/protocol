это файл README.md 
# protocol

Протокол передачи сообщений между двумя сторонами на уровне L2.

---

## ⚙️ Установка

```bash
npm install c9js/protocol
```

---

## 📁 Структура проекта

```
protocol/
├── test/
│   ├── entropy.js              # Пример оценки энтропии
│   └── proto.js                # Пример работы протокола
│
├── lib/
│   ├── constants/
│   │   ├── constants.js        # Список констант
│   │   ├── packet-fields.js    # Списки полей пакета
│   │   └── packet-structure.js # Структура пакета
│   │
│   ├── engines/
│   │   ├── crypto-engine.js    # Движок шифрования
│   │   ├── hash-engine.js      # Движок хеширования
│   │   ├── sync-engine.js      # Движок синхронизации
│   │   ├── encoder-engine.js   # Движок кодирования
│   │   ├── decoder-engine.js   # Движок декодирования
│   │   ├── scanner-engine.js   # Движок получения пакетов
│   │   └── sender-engine.js    # Движок отправки пакетов
│   │
│   ├── engine.js               # Базовый класс для всех движков
│   └── protocol.js             # Ядро протокола
│
└── index.js                    # Точка входа
```

---

## 📄 Лицензия

MIT License
