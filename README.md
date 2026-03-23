# `dec-sixbit`

Here is a pure JavaScript / TypeScript utility for using the [DEC SIXBIT](https://en.wikipedia.org/wiki/Six-bit_character_code#DEC_SIXBIT_code) character encoding.

This package can be used to help construct the Control and Addressing field of the [IL2P Protocol](https://packet-radio.net/wp-content/uploads/2020/10/il2p-specification0-4.pdf). However, it also contains basic functions so the user can perform a number of operations relating to the DEC SIXBIT encoding.

## To install

`npm install --save dec-sixbit`

## To use

```ts
import dec6b from 'dec-sixbit';
```

## Methods

### `aToSix`
Converts ASCII text to a DEC SIXBIT Buffer.

```ts
import { aToSix } from 'dec-sixbit';

const myMessage = 'A printable ASCII message';
const myD6bBuf = aToSix(myMessage);

console.log(myD6bBuf); // <Buffer 21 00 30 32 29 2e 34 21 22 2c 25 00 21 33 23 29 29 00 2d 25 33 33 21 27 25>
```

Replaces out-of-range codes with `?` (`0x1F`)

```ts
import { aToSix } from 'dec-sixbit';

const myMessage = 'A 🤮 💥 message';
const myD6bBuf = aToSix(myMessage);

console.log(myD6bBuf); // <Buffer 21 00 1f 00 1f 00 2d 25 33 33 21 27 25>
```

### `sixToA`
Converts bytes to an ASCII string
```ts
import { sixToA } from 'dec-sixbit';

const myBuf = Buffer.from('21003032292e3421222c25002133232929002d253333212725', 'hex');
const myString = sixToA(myBuf);

console.log(myString); // A PRINTABLE ASCII MESSAGE
```

Replaces out-of-range bytes with `?`
```ts
import { sixToA } from 'dec-sixbit';

const myBuf = Buffer.from('21009900f3002d253333212725', 'hex');
const myString = sixToA(myBuf);

console.log(myString); // A ? ? MESSAGE
```

### `pack`
Compresses a string or Buffer into the smallest 8-bit Buffer that it can. For example, a 4-character string of DEC SIXBIT can be packed into 3 bytes, since only 24 bits are required.

```ts
import { pack } from 'dec-sixbit';

const toPack = 'PACK';
const packed = pack(toPack);

console.log(packed.length); // 3
console.log(packed); // <Buffer c2 18 eb>
```

Packing is padded on the left by default when the number of bits of the DEC SIXBIT string is not evenly divisible by 8. For example, packing a 5-character string requires 30 bits, so the result needs to be padded with 2 zero bits.

```ts
import { pack } from 'dec-sixbit';

const toPack = 'PACK5';
const packed = pack(toPack);

console.log(packed.length); // 4
console.log(packed); // <Buffer 30 86 3a d5>
```
In this example, the Buffer `30 86 3a d5` can be written:
```
0x30    |0x86    |0x3a    |0xd5
00110000|10000110|00111010|11010101
  110000|100001|100011|101011|010101
  0x30  |0x21  |0x23  |0x2b  |0x15
  P      A      C      K      Z
```

Packing can also be padded on the right by passing `false` as the second parameter to `pack`:
```ts
import { pack } from 'dec-sixbit';

const toPack = 'PACK5';
const packed = pack(toPack, false);

console.log(packed.length); // 4
console.log(packed); // <Buffer c2 18 eb 54>
```

Notice how the result of this is the same as the result of calling `pack('PACK')` but with the addition of the byte `0x54`, which is the DEX SIXBIT value for 5 `0x15` shifted 2 bits to the left, (e.g. padded 2 bits on the right);

```ts
(0x15 << 2).toString(16); // 54
(0x15 << 2).toString(2); // 01010100
```

### `unPack`
Reverses the `pack` operation described above on any Buffer. Requires a padding argument, either `'left'` or `'right'`.

```ts
import { unPack } from 'dec-sixbit';

const aBuffer = Buffer.from('024963033a788a9d008e1b808a5035ce59009afc80a52b30', 'hex');
const unpacked = unPack(aBuffer, 'left');
```
