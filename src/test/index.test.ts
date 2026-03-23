import assert from 'node:assert';
import { describe, it } from 'node:test';
import { aToSix, sixToA, pack, unPack, il2pAddress, readIl2pAddressBuf } from '../index.js';

describe('aToSix', () => {
    const expectedBuf = Buffer.from([0x34, 0x25, 0x33, 0x34, 0x00, 0x24, 0x25, 0x23, 0x00, 0x16, 0x22, 0x29, 0x34, 0x01, 0x00, 0x0a, 0x0b]);

    it('is a function', () => {
        assert.strictEqual('function', typeof aToSix);
    });

    it('correctly converts ascii to a buffer', () => {
        const testString = 'TEST DEC 6BIT! *+';

        assert.deepEqual(aToSix(testString), expectedBuf);
    });

    it('converts lower case to upper case', () => {
        const testString = 'test dec 6bit! *+';

        assert.deepEqual(aToSix(testString), expectedBuf);
    });
});

describe('sixToA', () => {
    const testBuf = Buffer.from([0x34, 0x25, 0x33, 0x34, 0x00, 0x24, 0x25, 0x23, 0x00, 0x16, 0x22, 0x29, 0x34, 0x01, 0x00, 0x0a, 0x0b]);
    const expectedString = 'TEST DEC 6BIT! *+';

    it('is a function', () => {
        assert.strictEqual('function', typeof sixToA);
    });

    it('correctly converts a buffer to ascii', () => {
        assert.deepEqual(sixToA(testBuf), expectedString);
    });

    it('replaces values outside of range with "?"', () => {
        const bufWithOutOfRangeValues = Buffer.from([0x24, 0x25, 0x23, 0x5F, 0xa1, 0xb4]);

        assert.deepEqual(sixToA(bufWithOutOfRangeValues), 'DEC???');
    });
});

describe('pack and unPack', () => {
    it('pack produces a buffer of length 3 with exactly 4 characters', () => {
        const toPack = 'PACK';
        const result = pack(toPack, false);

        console.log(pack('DEC SIXBIT can be used for I2LP'));

        assert.strictEqual(result.length, 3);
        assert.deepEqual(toPack, unPack(result, 'left'));
    });

    it('correctly pack and unPack a buffer with more characters', () => {
        const toPack = 'let\'s pack this buffer full offa';
        const result = pack(toPack);

        assert.strictEqual(toPack.toUpperCase(), unPack(result, 'left'));
    });
});

describe('IL2P functions', () => {
    const kj7cxj = 'KJ7CXJ';
    const wb4nks = 'WB4NKS';
    const shrtA = 'S3T';
    const shrtB = 'W17';

    describe('il2pAddress', () => {
        it('recognizes two string inputs', () => {
            const addy = il2pAddress(wb4nks, kj7cxj);
            const understood = readIl2pAddressBuf(addy);

            assert.strictEqual(addy.length, 13);

            assert.strictEqual(understood.sourceCallsign, kj7cxj);
            assert.strictEqual(understood.destinationCallsign, wb4nks);
            assert.strictEqual(understood.sourceSsid, 0);
            assert.strictEqual(understood.destinationSsid, 0);
        });

        it('recognizes two string inputs with SSIDs included', () => {
            const addy = il2pAddress(wb4nks + '-14', kj7cxj + '-3');
            const understood = readIl2pAddressBuf(addy);

            assert.strictEqual(addy.length, 13);

            assert.strictEqual(understood.sourceCallsign, kj7cxj);
            assert.strictEqual(understood.destinationCallsign, wb4nks);
            assert.strictEqual(understood.sourceSsid, 3);
            assert.strictEqual(understood.destinationSsid, 14);
        });

        it('recognizes dest with string and number, source with just string', () => {
            const addy = il2pAddress(wb4nks, 14, kj7cxj);
            const understood = readIl2pAddressBuf(addy);

            assert.strictEqual(addy.length, 13);

            assert.strictEqual(understood.sourceCallsign, kj7cxj);
            assert.strictEqual(understood.destinationCallsign, wb4nks);
            assert.strictEqual(understood.sourceSsid, 0);
            assert.strictEqual(understood.destinationSsid, 14);
        });

        it('recognizes dest with string and number, source with just string using dash notation', () => {
            const addy = il2pAddress(wb4nks, 14, kj7cxj + '-12');
            const understood = readIl2pAddressBuf(addy);

            assert.strictEqual(addy.length, 13);

            assert.strictEqual(understood.sourceCallsign, kj7cxj);
            assert.strictEqual(understood.destinationCallsign, wb4nks);
            assert.strictEqual(understood.sourceSsid, 12);
            assert.strictEqual(understood.destinationSsid, 14);
        });

        it('recognizes dest with string, source with string and number', () => {
            const addy = il2pAddress(wb4nks, kj7cxj, 5);
            const understood = readIl2pAddressBuf(addy);

            assert.strictEqual(addy.length, 13);

            assert.strictEqual(understood.sourceCallsign, kj7cxj);
            assert.strictEqual(understood.destinationCallsign, wb4nks);
            assert.strictEqual(understood.destinationSsid, 0);
            assert.strictEqual(understood.sourceSsid, 5);
        });

        it('recognizes dest with string using dash notation, source with string and number', () => {
            const addy = il2pAddress(wb4nks + '-11', kj7cxj, 2);
            const understood = readIl2pAddressBuf(addy);

            assert.strictEqual(addy.length, 13);

            assert.strictEqual(understood.sourceCallsign, kj7cxj);
            assert.strictEqual(understood.destinationCallsign, wb4nks);
            assert.strictEqual(understood.destinationSsid, 11);
            assert.strictEqual(understood.sourceSsid, 2);
        });

        it('correctly pads short addresses', () => {
            const addy = il2pAddress(shrtA, shrtB);

            assert.strictEqual(addy.length, 13);

            assert.deepEqual(addy.subarray(3, 6), Buffer.from([0, 0, 0]));
            assert.deepEqual(addy.subarray(9, 12), Buffer.from([0, 0, 0]));
        });

        it('correctly pads short addresses with dash notation SSIDs', () => {
            const addy = il2pAddress(shrtA + '-14', shrtB + '-1');

            assert.deepEqual(addy.subarray(3, 6), Buffer.from([0, 0, 0]));
            assert.deepEqual(addy.subarray(9, 12), Buffer.from([0, 0, 0]));

            assert.deepEqual(addy[12], (14 << 4) + 1);
        });

        it('correctly pads short addresses with numerical SSIDs', () => {
            const addy = il2pAddress(shrtA, 11, shrtB, 6);

            assert.deepEqual(addy.subarray(3, 6), Buffer.from([0, 0, 0]));
            assert.deepEqual(addy.subarray(9, 12), Buffer.from([0, 0, 0]));

            assert.deepEqual(addy[12], (11 << 4) + 6);
        });
    });
});
