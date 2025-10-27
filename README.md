# protocol

📡 Низкоуровневый двусторонний протокол передачи сообщений с гарантией доставки, шифрованием и изоляцией канала связи после установки соединения.

> Позволяет напрямую отправлять и принимать сообщения через выбранный канал связи (например, L2), абстрагируя работу с пакетами, состояниями и очередями.

---

## ✨ Возможности

- 🔐 Шифрование и аутентификация по общему ключу
- 📦 Отправка сообщений любой длины
- ✅ Подтверждение доставки каждого сообщения (ACK)
- 🔁 Изоляция канала связи после установленного соединения
- 📡 Работа на уровне L2 (raw Ethernet)

---

## ⚙️ Установка

```bash
npm install c9js/protocol
```

---

## 📥 Быстрый старт

Пример: [`test/proto.js`](test/proto.js)

```js
const Protocol = require('protocol');

const protocol = new Protocol({ masterKey: 'secret-key' });

protocol.on('ready', () => {
    const message = 'Hello world!';
    protocol.sendMessage(message);
    console.log('Соединение готово!');
    console.log('Отправлено сообщение:', message);
});

protocol.on('delivered', (message) => {
    console.log('Подтверждение! Доставлено сообщение второй стороне:', message);
});

protocol.on('message', (message) => {
    console.log('Получено сообщение от второй стороны:', message);
});
```

---

## 📥 Работа с буфером

Пример: [`test/proto.js`](test/proto.js)

```js
const protocol = new Protocol({
    messageFormat: 'buffer',
    masterKey: 'secret-key',
});

protocol.on('ready', () => {
    const buffer = Buffer.from('8899AAFF', 'hex');
    protocol.sendMessage(buffer);
    console.log('Соединение готово!');
    console.log('Отправлен буфер:', buffer);
});

protocol.on('delivered', (buffer) => {
    console.log('Подтверждение! Доставлен буфер второй стороне:', buffer.toString('hex'));
});

protocol.on('message', (buffer) => {
    console.log('Получен буфер от второй стороны:', buffer.toString('hex'));
});
```

---

## 🔧 API

### `new Protocol(options)`

- `masterKey` — Главный ключ (строка)
- `channel` — Канал связи (по умолчанию `'l2raw'`)
- `messageFormat` — Формат сообщения `'string'`, `'buffer'` (по умолчанию `'string'`)
- `authLockTimeout` — Время на запрет повторной авторизации (`10000` мс / 10 сек)

Методы:

- `sendMessage(message)` — Добавляет новое сообщение в очередь для отправки

События протокола:

- `ready` — Соединение готово, старая очередь сообщений очищена
- `message` — Сообщение получено от второй стороны
- `delivered` — Сообщение доставлено второй стороне
- `data` — Пакет получен (низкоуровневое событие)

Пример:

```js
const protocol = new Protocol({ masterKey: 'secret-key' });

protocol.on('ready', () => console.log('Соединение готово!'));
protocol.on('message', (message) => console.log('Получено от второй стороны:', message));
protocol.on('delivered', (message) => console.log('Доставлено второй стороне:', message));
protocol.on('data', (packet, packetBuffer) => console.log('Пакет получен:', packet, packetBuffer));
```

---

## 📡 Каналы связи

### `l2raw` — Канал связи на уровне L2.

> Обмен пакетами через выбранный сетевой интерфейс на канальном уровне L2.

Опции:

- `iface` — Имя сетевого интерфейса (по умолчанию `'eth0'`)

События приемника:

- `scanner:start` — Приемник запущен
- `scanner:stop` — Приемник остановлен
- `scanner:restart`— Перезапуск приемника
- `scanner:error` — Во время работы произошла ошибка
- `scanner:exit` — Во время работы произошло аварийное завершение приемника
- `scanner:timeout` — Истекло время получения пакета (приемник будет перезапущен)

Пример:

```js
const protocol = new Protocol({
    channel: { name: 'l2raw', iface: 'eth0' },
    masterKey: 'secret-key',
});

protocol.on('scanner:start', () => console.log('Приемник запущен!'));
protocol.on('scanner:stop', () => console.log('Приемник остановлен!'));
protocol.on('scanner:restart', (reason) => console.log('Перезапуск приемника, причина:', reason));
protocol.on('scanner:error', (error) => console.log('Ошибка приемника:', error));

protocol.on('scanner:exit', (code) => {
    console.log('Аварийное завершение приемника, код выхода:', code);
});

protocol.on('scanner:timeout', () => {
    console.log('Истекло время получения пакета, приемник будет перезапущен!');
});
```

События передатчика:

- `sender:start` — Передатчик запущен
- `sender:stop` — Передатчик остановлен
- `sender:restart`— Перезапуск передатчика
- `sender:error` — Во время работы произошла ошибка
- `sender:exit` — Во время работы произошло аварийное завершение передатчика
- `sender:timeout` — Истекло время отправки пакета (передатчик будет перезапущен)

Пример:

```js
const protocol = new Protocol({
    channel: { name: 'l2raw', iface: 'eth0' },
    masterKey: 'secret-key',
});

protocol.on('sender:start', () => console.log('Передатчик запущен!'));
protocol.on('sender:stop', () => console.log('Передатчик остановлен!'));
protocol.on('sender:restart', (reason) => console.log('Перезапуск передатчика, причина:', reason));
protocol.on('sender:error', (error) => console.log('Ошибка передатчика:', error));

protocol.on('sender:exit', (code) => {
    console.log('Аварийное завершение передатчика, код выхода:', code);
});

protocol.on('sender:timeout', () => {
    console.log('Истекло время отправки пакета, передатчик будет перезапущен!');
});
```

---

## 📁 Структура проекта

```
lib/
├── protocol.js               # Ядро протокола
│
├── rules/
│   ├── engines.js            # Правило инициализации движков
│   └── logic.js              # Правило инициализации логических единиц
│
├── constants/
│   ├── constants.js          # Список констант
│   ├── packet-categories.js  # Список категорий пакетов
│   ├── packet-types.js       # Список типов пакетов
│   ├── packet-fields.js      # Списки полей пакета
│   └── packet-structure.js   # Структура пакета
│
├── contracts/
│   ├── errors.js             # Контракт ошибок
│   ├── commands.js           # Контракт команд (Protocol → Channel)
│   └── signals.js            # Контракт сигналов (Channel → Protocol)
│
└── engines/
    ├── error/
    │   └── error-engine.js   # Движок ошибок
    │
    ├── lang/
    │   ├── lang-engine.js    # Движок языков
    │   ├── logic/
    │   │   ├── loader.js     # Логика загрузки выбранного языка
    │   │   └── factory.js    # Логика инициализации выбранного языка
    │   │
    │   └── ru/               # Русский язык
    │       └── errors.js     # Локализация списка ошибок
    │
    ├── command/
    │   ├── command-engine.js # Движок команд
    │   ├── logic/
    │   │   └── binder.js     # Логика привязки списка команд (Protocol → Channel)
    │   │
    │   └── commands/
    │       ├── core.js       # Список внутренних команд протокола
    │       ├── scanner.js    # Список команд приемника
    │       └── sender.js     # Список команд передатчика
    │
    ├── port/
    │   ├── port-engine.js    # Движок портов
    │   ├── logic/
    │   │   ├── registrar.js  # Логика регистрации списка сигналов (Channel → Protocol)
    │   │   ├── scanner.js    # Логика получения списка портов приемника
    │   │   └── sender.js     # Логика получения списка портов передатчика
    │   │
    │   └── ports/
    │       ├── scanner.js    # Список портов приемника
    │       └── sender.js     # Список портов передатчика
    │
    ├── state/
    │   ├── state-engine.js   # Движок состояний
    │   └── logic/
    │       ├── state.js      # Логика состояний
    │       ├── positions.js  # Логика списка позиций
    │       ├── packetType.js # Логика списка типов пакетов
    │       ├── origin.js     # Логика отправителя пакета
    │       └── marker.js     # Логика проверочного маркера
    │
    ├── message/
    │   ├── message-engine.js # Движок обработки сообщений
    │   └── logic/
    │       ├── formatter.js  # Логика выбора формата сообщений
    │       ├── encoder.js    # Логика кодирования сообщений
    │       ├── decoder.js    # Логика декодирования сообщений
    │       ├── fragment.js   # Логика сборки исходных сообщений
    │       └── pending.js    # Логика очереди для отправки сообщений
    │
    ├── packet/
    │   ├── packet-engine.js  # Движок обработки пакетов
    │   └── logic/
    │       ├── builder.js    # Логика сборки пакетов отправки
    │       ├── encoder.js    # Логика кодирования пакетов
    │       └── decoder.js    # Логика декодирования пакетов
    │
    ├── crypto/
    │   ├── crypto-engine.js  # Движок шифрования
    │   └── logic/
    │       ├── encryptor.js  # Логика шифрования
    │       └── decryptor.js  # Логика дешифрования
    │
    ├── hash/
    │   ├── hash-engine.js    # Движок хеширования
    │   └── logic/
    │       └── algorithm.js  # Логика алгоритмов хеширования
    │
    ├── flow/
    │   ├── flow-engine.js    # Движок обработки потока
    │   └── logic/
    │       ├── incoming.js   # Логика обработки входящих пакетов
    │       └── outgoing.js   # Логика обработки исходящих пакетов
    │
    ├── channel/
    │   ├── channel-engine.js # Движок каналов связи
    │   ├── logic/
    │   │   ├── loader.js     # Логика загрузки выбранного канала связи
    │   │   └── factory.js    # Логика инициализации выбранного канала связи
    │   │
    │   └── l2raw/            # Канал связи на уровне L2
    │       ├── init.js       # Роль инициализации канала связи
    │       ├── scanner.js    # Роль адаптации приемника
    │       └── sender.js     # Роль адаптации передатчика
    │
    └── io/
        ├── io-engine.js      # Движок ввода-вывода
        └── logic/
            ├── scanner.js    # Логика получения пакетов
            └── sender.js     # Логика отправки пакетов
```

---

## 📄 Лицензия

MIT License
