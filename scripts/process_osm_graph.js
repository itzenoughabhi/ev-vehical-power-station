const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../frontend/public/data/boisar_osm_roads.json');
const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const CENTER_LAT = 19.7902325;
const CENTER_LON = 72.7657359;

const METERS_PER_DEG_LAT = 110680;
const METERS_PER_DEG_LON = 104746;

const SCALE_3D = 1 / 25;

function latLonToLocal3D(lat, lon) {
  const dLat = lat - CENTER_LAT;
  const dLon = lon - CENTER_LON;
  const x = dLon * METERS_PER_DEG_LON * SCALE_3D;
  const z = -dLat * METERS_PER_DEG_LAT * SCALE_3D;
  return { x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100 };
}

console.log('Processing OSM elements into road graph & GeoJSON...');

const nodesMap = new Map();
const segments = [];
const geojsonFeatures = [];

const ways = raw.elements.filter(e => e.type === 'way' && Array.isArray(e.geometry) && e.geometry.length >= 2);

console.log(`Found ${ways.length} usable OSM ways with geometry.`);

ways.forEach((way, idx) => {
  const highwayType = way.tags?.highway || 'residential';
  const name = way.tags?.name || (highwayType === 'primary' ? 'Main Arterial' : 'Urban Road');
  const geomCoords = way.geometry.map(g => [g.lon, g.lat]);
  const localPoints = way.geometry.map(g => latLonToLocal3D(g.lat, g.lon));

  geojsonFeatures.push({
    type: 'Feature',
    id: way.id || idx,
    properties: {
      id: way.id || idx,
      name,
      highway: highwayType,
      isMajor: ['primary', 'secondary', 'tertiary', 'trunk'].includes(highwayType),
    },
    geometry: {
      type: 'LineString',
      coordinates: geomCoords,
    },
  });

  for (let i = 0; i < way.geometry.length; i++) {
    const pt = way.geometry[i];
    const nodeId = `${pt.lat.toFixed(6)},${pt.lon.toFixed(6)}`;
    if (!nodesMap.has(nodeId)) {
      nodesMap.set(nodeId, {
        id: nodeId,
        lat: pt.lat,
        lon: pt.lon,
        local3D: latLonToLocal3D(pt.lat, pt.lon),
        connectedNodeIds: [],
      });
    }

    if (i > 0) {
      const prevPt = way.geometry[i - 1];
      const prevNodeId = `${prevPt.lat.toFixed(6)},${prevPt.lon.toFixed(6)}`;
      const prevNode = nodesMap.get(prevNodeId);
      const currNode = nodesMap.get(nodeId);

      if (!prevNode.connectedNodeIds.includes(nodeId)) {
        prevNode.connectedNodeIds.push(nodeId);
      }
      if (!currNode.connectedNodeIds.includes(prevNodeId)) {
        currNode.connectedNodeIds.push(prevNodeId);
      }
    }
  }

  segments.push({
    id: `seg-${way.id || idx}`,
    osmId: way.id,
    name,
    highwayType,
    geometryGeo: geomCoords,
    geometry3D: localPoints,
    lengthPoints: geomCoords.length,
  });
});

console.log(`Extracted ${nodesMap.size} unique road nodes and ${segments.length} road segments.`);

const geojsonPath = path.join(__dirname, '../frontend/public/data/boisar_roads_geojson.json');
fs.writeFileSync(geojsonPath, JSON.stringify({
  type: 'FeatureCollection',
  features: geojsonFeatures,
}, null, 2));
console.log(`Saved GeoJSON to ${geojsonPath}`);

const graphPath = path.join(__dirname, '../frontend/public/data/boisar_road_graph.json');
fs.writeFileSync(graphPath, JSON.stringify({
  center: { lat: CENTER_LAT, lon: CENTER_LON },
  metersPerDegLat: METERS_PER_DEG_LAT,
  metersPerDegLon: METERS_PER_DEG_LON,
  scale3D: SCALE_3D,
  totalNodes: nodesMap.size,
  totalSegments: segments.length,
  nodes: Array.from(nodesMap.values()),
  segments,
}, null, 2));
console.log(`Saved Road Graph to ${graphPath}`);
