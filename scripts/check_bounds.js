const fs = require('fs');
const path = require('path');

function getGLBBounds(filePath) {
  const buf = fs.readFileSync(filePath);
  const jsonChunkLen = buf.readUInt32LE(12);
  const jsonChunkType = buf.toString('ascii', 16, 20);
  if (jsonChunkType !== 'JSON') return null;

  const jsonStr = buf.toString('utf8', 20, 20 + jsonChunkLen);
  const gltf = JSON.parse(jsonStr);

  let overallMin = [Infinity, Infinity, Infinity];
  let overallMax = [-Infinity, -Infinity, -Infinity];

  if (gltf.accessors) {
    for (const acc of gltf.accessors) {
      if (acc.type === 'VEC3' && acc.min && acc.max) {
        for (let i = 0; i < 3; i++) {
          overallMin[i] = Math.min(overallMin[i], acc.min[i]);
          overallMax[i] = Math.max(overallMax[i], acc.max[i]);
        }
      }
    }
  }

  const size = [
    Math.round((overallMax[0] - overallMin[0]) * 10) / 10,
    Math.round((overallMax[1] - overallMin[1]) * 10) / 10,
    Math.round((overallMax[2] - overallMin[2]) * 10) / 10,
  ];

  return { min: overallMin, max: overallMax, size };
}

const cityDir = path.resolve(__dirname, '..', 'frontend', 'public', 'models', 'city');
const files = fs.readdirSync(cityDir).filter(f => f.endsWith('.glb'));

for (const f of files) {
  try {
    const res = getGLBBounds(path.join(cityDir, f));
    if (res) {
      console.log(`${f.padEnd(25)} size: [${res.size.join(', ')}]`);
    }
  } catch (err) {
    console.error(f, err.message);
  }
}
