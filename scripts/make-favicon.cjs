#!/usr/bin/env node
/**
 * Writes /favicon.ico at build time (a 32x32 amber diamond on navy, matching
 * favicon.svg). Generated here because the repo is updated through a
 * text-only API that cannot commit binary files.
 */
const fs = require('fs');
const path = require('path');
const W = 32, H = 32;
const rows = [];
for (let y = H - 1; y >= 0; y--) { // BMP rows are stored bottom-up
  for (let x = 0; x < W; x++) {
    const inside = Math.abs(x - 15.5) + Math.abs(y - 15.5) <= 11;
    rows.push(...(inside ? [0x24, 0xbf, 0xfb, 255] : [0x17, 0x06, 0x02, 255])); // BGRA
  }
}
const header = Buffer.alloc(40);
header.writeUInt32LE(40, 0); header.writeInt32LE(W, 4); header.writeInt32LE(H * 2, 8);
header.writeUInt16LE(1, 12); header.writeUInt16LE(32, 14); header.writeUInt32LE(W * H * 4, 20);
const img = Buffer.concat([header, Buffer.from(rows), Buffer.alloc(4 * H)]);
const dir = Buffer.alloc(22);
dir.writeUInt16LE(0, 0); dir.writeUInt16LE(1, 2); dir.writeUInt16LE(1, 4);
dir.writeUInt8(W, 6); dir.writeUInt8(H, 7); dir.writeUInt16LE(1, 10); dir.writeUInt16LE(32, 12);
dir.writeUInt32LE(img.length, 14); dir.writeUInt32LE(22, 18);
fs.writeFileSync(path.resolve(__dirname, '..', 'favicon.ico'), Buffer.concat([dir, img]));
console.log('favicon.ico written');
