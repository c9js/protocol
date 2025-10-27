/*────────────────────────────────────────────────────────────────────────────────────────────────*/

Object.defineProperties(global,{__:{set:v=>process.exit(_=v)},_:{set:console.log}});
Object.defineProperty(global, '$', {value:{}});

/*────────────────────────────────────────────────────────────────────────────────────────────────*/

const fs = require('fs');
const path = require('path');

// Получаем директорию из аргумента командной строки (или текущую по умолчанию)
const inputDir = path.resolve('../lib/engines');

// Имя результирующего файла (всегда создаётся в текущей директории)
const outputFile = path.resolve(__dirname, '1.txt');

console.log(`📂 Чтение файлов из: ${inputDir}`);
console.log(`📝 Результат будет сохранён в: ${outputFile}`);

// Проверяем, существует ли указанная директория
if (!fs.existsSync(inputDir) || !fs.statSync(inputDir).isDirectory()) {
    console.error('❌ Ошибка: указанная директория не существует или не является папкой.');
    process.exit(1);
}

// Получаем список всех файлов в указанной директории
const files = fs.readdirSync(inputDir)
    .filter(f => {
        const fullPath = path.join(inputDir, f);
        return fs.statSync(fullPath).isFile();
    });

let result = '';

for (const file of files) {
    const fullPath = path.join(inputDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    result += `это файл ${file}\n${content}\n\n`;
}

// Записываем результат в 1.txt в текущей директории
fs.writeFileSync(outputFile, result, 'utf8');

console.log(`✅ Файл ${outputFile} успешно создан. Добавлено ${files.length} файлов.`);

/*

это последний файл

теперь что мне нужно

я сейчас хочу переосмыслить архитектуру проекта

Например я уже пришел к тому что у меня будет подобная архитектура
└── lib/
    ├── constants.js        # Список констант
    ├── packet-structure.js # Структура пакета
    ├── packet-fields.js    # Списки полей пакета
    ├── engine.js           # Базовый класс для всех движков
    ├── crypto-engine.js    # Движок шифрования
    ├── hash-engine.js      # Движок хеширования
    ├── sync-engine.js      # Движок синхронизации
    ├── encode-engine.js    # Движок кодирования
    ├── decode-engine.js    # Движок декодирования
    └── protocol.js         # Ядро протокола


*/
