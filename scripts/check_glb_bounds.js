const fs = require('fs');
const path = require('path');

const files = [
  'frontend/public/models/vehicles/cybertruck.glb',
  'frontend/public/models/vehicles/suv.glb',
  'frontend/public/models/vehicles/van.glb',
  'frontend/public/models/vehicles/sports_car.glb',
  'frontend/public/models/city/building.glb',
  'frontend/public/models/city/skyscraper.glb',
  'frontend/public/models/city/hotel.glb',
  'frontend/public/models/city/apartment.glb',
  'frontend/public/models/city/traffic_light.glb',
  'frontend/public/models/stations/ev_station.glb'
];

for (const f of files) {
  const p = path.resolve(__dirname, '..', f);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    console.log(`${f}: ${(stat.size / 1024).toFixed(1)} KB`);
  } else {
    console.log(`Missing: ${f}`);
  }
}
