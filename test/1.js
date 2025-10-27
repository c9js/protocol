/*────────────────────────────────────────────────────────────────────────────────────────────────*/

Object.defineProperties(global,{__:{set:v=>process.exit(_=v)},_:{set:console.log}});
Object.defineProperty(global, '$', {value:{}});

/*────────────────────────────────────────────────────────────────────────────────────────────────*/

const PACKET = new class packetStructure {
    INIT = new class {
        HASH = { OFFSET: 32, SIZE: 64 } // Хэш-сумма
    }
};

const {
    HASH, // Хэш-сумма
} = PACKET.INIT;

const P = new class packetFields {
    fields(type) {
        return fields;
    }
    SCAN_FIELDS = {
    // Список полей пакета инициализации
        INIT: this.fields('INIT', {
            HASH, // Хэш-сумма
        }),
    }
};

_=P
