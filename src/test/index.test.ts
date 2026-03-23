import assert from 'node:assert';
import { describe, it } from 'node:test';
import { aToSix, sixToA, pack, unPack } from '../index.js';

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
        const result = pack(toPack);

        assert.strictEqual(result.length, 3);
        assert.deepEqual(toPack, unPack(result, 'left'));
    });

    it('correctly pack and unPack a buffer with more characters', () => {
        const toPack = 'let\'s pack this buffer full offa';
        const result = pack(toPack);

        assert.strictEqual(toPack.toUpperCase(), unPack(result, 'left'));
    });
});
