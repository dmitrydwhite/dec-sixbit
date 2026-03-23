const asciiArr = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\^_]` as const;
const UNCLEAR = asciiArr.indexOf('?');

export function aToSix(str: string): Buffer {
    const strArr = Array.from(str.toUpperCase());

    return Buffer.from(strArr.map(c => {
        const value = asciiArr.indexOf(c);

        return value < 0 ? UNCLEAR : value;
    }));
}

export function sixToA(buf: Buffer): string {
    return Array.from(buf).map(b => asciiArr[b] || '?').join('');
}

function to6bitStr(num: number) {
    const asBin = num.toString(2);

    if (asBin.length === 6) {
        return asBin;
    }

    return (num | 32).toString(2).replace(/^1/, '0');
}

export function pack(text: Buffer | string, leftPad = true): Buffer {
    const entry = typeof text === 'string' ? aToSix(text) : text;
    let bitStr = '';

    for (let c = 0; c < text.length; c++) {
        bitStr += to6bitStr(entry[c] ?? UNCLEAR);
    }

    while (bitStr.length % 8 !== 0) {
        bitStr = leftPad ? `0${bitStr}` : `${bitStr}0`;
    }

    const result = [];

    while (bitStr.length) {
        const num = parseInt(bitStr.slice(0, 8), 2);

        result.push(num);
        bitStr = bitStr.slice(8);
    }

    return Buffer.from(result);
}

function to8bitStr(num: number) {
    const asBin = num.toString(2);

    if (asBin.length === 8) {
        return asBin;
    }

    return (num | 128).toString(2).replace(/^1/, '0');
}

export function unPack(buf: Buffer, padding: 'left' | 'right'): string {
    const working = Array.from(buf);
    let bitStr = working.map(b => to8bitStr(b)).join('');
    let result = '';

    if (padding === 'left') {
        while (bitStr.length >= 6) {
            result = `${asciiArr[parseInt(bitStr.slice(-6), 2)]}${result}`;
            bitStr = bitStr.slice(0, -6);
        }

        return result;
    }

    while (bitStr.length >= 6) {
        result += asciiArr[parseInt(bitStr.slice(0, 6), 2)];
        bitStr = bitStr.slice(6);
    }

    return result.trim();
}
