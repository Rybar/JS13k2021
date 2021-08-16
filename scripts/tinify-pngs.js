const { execSync } = require('child_process');
const { existsSync, readFileSync, statSync } = require('fs');
const tinify = require('tinify');

// retreive TinyPNG API key
if (!existsSync('./keys.json')) {
  return;
}

const keys = JSON.parse(readFileSync('./keys.json').toString());
if (!keys.TINIFY_API_KEY) {
  return;
}

tinify.key = keys.TINIFY_API_KEY;

// filter PNGs from staged files being committed
const pngs = execSync('git diff --cached --name-only | grep "png$" | cut -d ":" -f 2').toString();

pngs
 .split('\n')
 .map(png => png.trim())
 .filter(png => png !== '')
 .forEach(async (png) => {
    const original = statSync(png).size;

    // TinyPNG
    const image = tinify.fromFile(png);
    await image.toFile(png);
    const optimized = statSync(png).size;

    // AdvPNG
    execSync(`advpng -l -4 ${png}`);
    const recompressed = statSync(png).size

    console.log(`${png} ${original} bytes -> TinyPNG ${optimized} bytes -> AdvPNG ${recompressed}`);

    // stage optimized PNG for inclusion in commit
    execSync(`git add ${png}`);
  });

