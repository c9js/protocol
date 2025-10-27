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
    console.log('Соединение готово!');
    protocol.sendMessage('Hello world!');
});

protocol.on('message', (message) => {
    console.log('Получено от второй стороны:', message);
});

protocol.on('delivered', (message) => {
    console.log('Доставлено второй стороне:', message);
});
```

---

## 📥 Работа с буфером

Пример: [`test/proto.js`](test/proto.js)

```js
const Protocol = require('protocol');

const protocol = new Protocol({
    messageFormat: 'buffer',
    masterKey: 'secret-key',
});

protocol.on('ready', () => {
    protocol.sendMessage(Buffer.from('33aaff', 'hex'));
});

protocol.on('message', (buffer) => {
    console.log('Получено от второй стороны:', buffer.toString('hex'));
});

protocol.on('delivered', (buffer) => {
    console.log('Доставлено второй стороне:', buffer.toString('hex'));
});
```

---

## 🔧 API

### `new Protocol(options)`

- `channel` — Канал связи
- `masterKey` — Главный ключ (строка)
- `messageFormat` — Формат сообщения (string | buffer)
- `authLockTimeout` — Время на запрет повторной авторизации

Методы:

- `sendMessage(message)` — Добавляет новое сообщение в очередь для отправки

События протокола:

- `ready` — Соединение готово, старая очередь сообщений очищена
- `message` — Сообщение получено от второй стороны
- `delivered` — Сообщение доставлено второй стороне
- `data` — Пакет получен

События канала связи [приемник]:

- `scanner:error` — Во время работы произошла ошибка
- `scanner:start` — Приемник запущен
- `scanner:stop` — Приемник остановлен
- `scanner:exit` — Во время работы произошло аварийное завершение воркера
- `scanner:restart`— Приемник перезапущен
- `scanner:timeout` — Закончилось отведенное время на получение пакета

События канала связи [передатчик]:

- `sender:error` — Во время работы произошла ошибка
- `sender:start` — Передатчик запущен
- `sender:stop` — Передатчик остановлен
- `sender:exit` — Во время работы произошло аварийное завершение воркера
- `sender:restart`— Передатчик перезапущен
- `sender:timeout` — Закончилось отведенное время на отправку пакета

---

## 📡 Каналы связи

### `l2raw` — Канал связи на уровне L2.

> Обмен пакетами через выбранный сетевой интерфейс на канальном уровне L2.

Опции:

- `iface` — Имя сетевого интерфейса (например, `'eth0'`)

Пример:

```js
const Protocol = require('protocol');

const protocol = new Protocol({
    channel: { name: 'l2raw', iface: 'eth0' },
    masterKey: 'secret-key',
});
```

---

## 📁 Структура проекта

```
lib/
├── protocol.js                   # Ядро протокола
│
├── init/
│   ├── engine.js                 # Инициализатор движков
│   └── logic.js                  # Инициализатор логических единиц
│
├── constants/
│   ├── constants.js              # Список констант
│   ├── packet-categories.js      # Список категорий пакетов
│   ├── packet-types.js           # Список типов пакетов
│   ├── packet-fields.js          # Списки полей пакета
│   └── packet-structure.js       # Структура пакета
│
└── engines/
    ├── event/
    │   ├── event-engine.js       # Движок событий
    │   └── logic/
    │       ├── readyEvent.js     # Логика события готовности соединения
    │       ├── dataEvent.js      # Логика события получения пакета
    │       ├── messageEvent.js   # Логика события получения нового сообщения
    │       └── deliveredEvent.js # Логика события доставки сообщения
    │
    ├── error/
    │   └── error-engine.js       # Движок ошибок
    │
    ├── state/
    │   ├── state-engine.js       # Движок состояний
    │   └── logic/
    │       ├── state.js          # Логика состояний
    │       ├── positions.js      # Логика списка позиций
    │       ├── packetType.js     # Логика списка типов пакетов
    │       ├── origin.js         # Логика отправителя пакета
    │       └── marker.js         # Логика проверочного маркера
    │
    ├── message/
    │   ├── message-engine.js     # Движок обработки сообщений
    │   └── logic/
    │       ├── formatter.js      # Логика выбора формата сообщений
    │       ├── encoder.js        # Логика кодирования сообщений
    │       ├── decoder.js        # Логика декодирования сообщений
    │       ├── fragment.js       # Логика сборки исходных сообщений
    │       └── pending.js        # Логика очереди для отправки сообщений
    │
    ├── packet/
    │   ├── packet-engine.js      # Движок обработки пакетов
    │   └── logic/
    │       ├── builder.js        # Логика сборки пакетов отправки
    │       ├── encoder.js        # Логика кодирования пакетов
    │       └── decoder.js        # Логика декодирования пакетов
    │
    ├── crypto/
    │   ├── crypto-engine.js      # Движок шифрования
    │   └── logic/
    │       ├── encryptor.js      # Логика шифрования
    │       └── decryptor.js      # Логика дешифрования
    │
    ├── hash/
    │   ├── hash-engine.js        # Движок хеширования
    │   └── logic/
    │       └── algorithm.js      # Логика алгоритмов хеширования
    │
    ├── flow/
    │   ├── flow-engine.js        # Движок обработки потока
    │   └── logic/
    │       ├── incoming.js       # Логика обработки входящих пакетов
    │       └── outgoing.js       # Логика обработки исходящих пакетов
    │
    ├── channel/
    │   ├── channel-engine.js     # Движок каналов связи
    │   └── logic/
    │       ├── factory.js        # Логика инициализации канала связи
    │       └── l2raw.js          # Логика канала связи на уровне L2
    │
    └── io/
        ├── io-engine.js          # Движок ввода-вывода
        └── logic/
            ├── scanner.js        # Логика получения пакетов
            └── sender.js         # Логика отправки пакетов
```

---

## 📄 Лицензия

MIT License
