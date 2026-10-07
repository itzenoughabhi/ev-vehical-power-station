const https = require('https');
const fs = require('fs');
const path = require('path');

const bbox = '19.765,72.730,19.815,72.795';
const query = `[out:json][timeout:25];(way["highway"~"primary|secondary|tertiary|residential|trunk"](${bbox}););out geom qt;`;

const servers = [
  'overpass.kumi.systems',
  'lz4.overpass-api.de',
  'overpass-api.de',
];

async function tryServer(hostname) {
  return new Promise((resolve, reject) => {
    console.log(`Trying ${hostname}...`);
    const postData = 'data=' + encodeURIComponent(query);
    const req = https.request({
      hostname,
      port: 443,
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'EVNEXUS-DigitalTwin/1.0',
      },
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Non-JSON response from ${hostname}: ${data.slice(0, 80)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout on ${hostname}`)); });
    req.write(postData);
    req.end();
  });
}

async function run() {
  for (const s of servers) {
    try {
      const data = await tryServer(s);
      if (data && data.elements && data.elements.length > 0) {
        console.log(`✅ Success! Received ${data.elements.length} OSM elements from ${s}`);
        const outputPath = path.join(__dirname, '../frontend/public/data/boisar_osm_roads.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Saved to ${outputPath}`);
        return;
      }
    } catch (e) {
      console.warn(`Failed on ${s}: ${e.message}`);
    }
  }
}

run();
