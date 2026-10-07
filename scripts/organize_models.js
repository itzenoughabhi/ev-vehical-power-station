const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'all models');
const destBase = path.resolve(__dirname, '..', 'frontend', 'public', 'models');

const dirs = ['stations', 'vehicles', 'city', 'characters', 'props'];
for (const d of dirs) {
  const p = path.join(destBase, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copySafe(srcName, destFolder, destName) {
  const srcPath = path.join(srcDir, srcName);
  const destPath = path.join(destBase, destFolder, destName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcName} -> ${destFolder}/${destName}`);
  } else {
    console.warn(`File not found: ${srcName}`);
  }
}

// 1. Stations
copySafe('electric_car_charging_station_enbw.glb', 'stations', 'ev_station.glb');
copySafe('electric_car_charging_station_enbw.glb', 'stations', 'electric_car_charging_station_enbw.glb');
copySafe('Power Box.glb', 'stations', 'power_box.glb');

// 2. Vehicles
const vehicleMapping = {
  'cybertruck.glb': 'cybertruck.glb',
  'cybertruck.glb': 'model_y.glb', // default model_y fallback
  'Car.glb': 'car.glb',
  'Car-unqqkULtRU.glb': 'car_sedan.glb',
  'CAR Model.glb': 'car_model.glb',
  'SUV.glb': 'suv.glb',
  'Van.glb': 'van.glb',
  'Bus.glb': 'bus.glb',
  'Pickup Truck.glb': 'pickup_truck.glb',
  'Sports Car.glb': 'sports_car.glb',
  'Police Car.glb': 'police_car.glb',
  'Convertible.glb': 'convertible.glb',
  'mercedes_benz_vision_eqs.glb': 'mercedes_benz_vision_eqs.glb',
  '2025_porsche_taycan_turbo_gt_weissach_package.glb': 'taycan.glb',
  'lucid_air_sapphire_2024.glb': 'lucid.glb',
  'tata_signa_cargo_truck__low_poly_game_ready_pbr.glb': 'truck.glb',
  'Bicycle.glb': 'bicycle.glb',
  'Motorcycle.glb': 'motorcycle.glb'
};

for (const [src, dest] of Object.entries(vehicleMapping)) {
  copySafe(src, 'vehicles', dest);
}
// Also copy cybertruck specifically
copySafe('cybertruck.glb', 'vehicles', 'cybertruck.glb');

// 3. City & Buildings
const cityMapping = {
  'Apartment building.glb': 'apartment.glb',
  'Apartment building.glb': 'apartment_building.glb',
  'Building.glb': 'building.glb',
  'Big Building.glb': 'big_building.glb',
  'Brown Building.glb': 'brown_building.glb',
  'Building Green.glb': 'building_green.glb',
  'Building Red.glb': 'building_red.glb',
  'Building Red Corner.glb': 'building_red_corner.glb',
  'Hospital.glb': 'hospital.glb',
  'Hotel Building.glb': 'hotel.glb',
  'House with driveway.glb': 'house.glb',
  'Large Building.glb': 'large_building.glb',
  'Skyscraper.glb': 'skyscraper.glb',
  'Town House.glb': 'townhouse.glb',
  'science_centre_of_colorina.glb': 'science_centre.glb',
  'signal_tower.glb': 'signal_tower.glb',
  'Tree.glb': 'tree.glb',
  'Bench.glb': 'bench.glb',
  'Cone.glb': 'traffic_props.glb',
  'Cone.glb': 'cone.glb',
  'Bus Stop.glb': 'bus_stop.glb',
  'Billboard.glb': 'billboard.glb',
  'Traffic light.glb': 'traffic_light.glb',
  'Stop sign.glb': 'stop_sign.glb',
  'Trash Can.glb': 'trash_can.glb',
  'Dumpster.glb': 'dumpster.glb',
  'Fire hydrant.glb': 'fire_hydrant.glb',
  'Mailbox.glb': 'mailbox.glb',
  'ATM.glb': 'atm.glb',
  'Fence.glb': 'fence.glb',
  'Planter & Bushes.glb': 'planter.glb',
  'Manhole Cover.glb': 'manhole.glb'
};

for (const [src, dest] of Object.entries(cityMapping)) {
  copySafe(src, 'city', dest);
}

// 4. Characters
const charMapping = {
  'Animated Woman.glb': 'animated_woman.glb',
  'Business Man.glb': 'business_man.glb',
  'Casual Character.glb': 'casual_character.glb',
  'Man.glb': 'man.glb',
  'Woman.glb': 'woman.glb',
  'Worker.glb': 'worker.glb',
  'Suit.glb': 'suit.glb',
  'Punk.glb': 'punk.glb'
};

for (const [src, dest] of Object.entries(charMapping)) {
  copySafe(src, 'characters', dest);
}

console.log('All models organized successfully!');
