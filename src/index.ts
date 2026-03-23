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

export function clampCs(str: string) {
    let clamped = str.slice(0, 6);

    while (clamped.length < 6) {
        clamped = clamped + ' ';
    }

    return clamped;
}

export function il2pAddress(destCs: string, arg2: string | number, arg3?: string | number, arg4?: number): Buffer {
    if (!destCs) {
        throw new Error('Destination Callsign required!');
    }

    let srcCs = typeof arg2 === 'string' ? arg2 : typeof arg2 === 'number' ? arg3 : null;

    if (!srcCs || typeof srcCs === 'number') {
        throw new Error('Destination and Source Callsigns required!');
    }

    let destSsid = typeof arg2 === 'number' ? arg2 : 0;
    let srcSsid = typeof arg3 === 'number' ? arg3 : typeof arg4 === 'number' ? arg4 : 0;

    if (typeof arg2 !== 'number') {
        const splitSsid = Number(destCs.split('-').pop());

        if (Number.isFinite(splitSsid)) {
            destSsid = splitSsid;
            destCs = destCs.split('-').slice(0, -1).join('-');
        }
    }

    if (typeof arg4 !== 'number') {
        const splitSsid = Number(srcCs.split('-').pop());

        if (Number.isFinite(splitSsid)) {
            srcSsid = splitSsid;
            srcCs = srcCs.split('-').slice(0, -1).join('-');
        }
    }

    return Buffer.concat([
        aToSix(clampCs(destCs)),
        aToSix(clampCs(srcCs)),
        Buffer.from([(destSsid << 4) + srcSsid]),
    ]);
}

export function readIl2pAddressBuf(buf: Buffer) {
    if (buf.length !== 13) {
        throw new Error('Expected an IL2P Address Field buffer of 13 bytes');
    }

    const srcSsid = (buf[12] as number) & 15;
    const destSsid = (buf[12] as number) >> 4;

    const destBuf = Buffer.from(Array.from(buf.subarray(0, 6)).map(b => b & 63));
    const destCs = sixToA(destBuf).trim();

    const srcBuf = Buffer.from(Array.from(buf.subarray(6, 12)).map(b => b & 63));
    const srcCs = sixToA(srcBuf).trim();

    return {
        sourceSsid: srcSsid,
        destinationSsid: destSsid,
        sourceCallsign: srcCs,
        destinationCallsign: destCs,
    };
}
