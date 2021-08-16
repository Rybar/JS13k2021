const fs = require('fs');

// report zip size and remaining bytes
const size = fs.statSync('dist/game.zip').size;
const limit = 1024 * 13;
const remaining = limit - size;
const percentage = Math.round((remaining / limit) * 100 * 100) / 100;
console.log('\n-------------');
console.log(`USED: ${size} BYTES`);
console.log(`REMAINING: ${remaining} BYTES (${percentage}% of 13k budget)`);
console.log('-------------\n');

