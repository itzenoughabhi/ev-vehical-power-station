import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbService } from './database/prisma';
import { stationService } from './modules/stations/station.service';
import { vehicleService } from './modules/vehicles/vehicle.service';
import { energyService } from './modules/energy/energy.service';
import { eventService } from './modules/events/event.service';
import { aiService } from './modules/ai/ai.service';
import { simulationEngine } from './modules/simulation/simulation.engine';
import { WebSocketGateway } from './websocket/gateway';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Create HTTP server & WebSocket gateway
const server = http.createServer(app);
const wsGateway = new WebSocketGateway(server);

// --- REST API ROUTES ---

// Health & Info
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'EVNEXUS Boisar Digital Twin Server',
    databaseConnected: dbService.isConnected,
    timestamp: new Date().toISOString(),
  });
});

// Stations
app.get('/stations', (req, res) => {
  res.json(stationService.getAllStations());
});

app.get('/stations/:id', (req, res) => {
  const station = stationService.getStationById(req.params.id);
  if (!station) return res.status(404).json({ error: 'Station not found' });
  res.json(station);
});

// Service Center
app.get('/service-center', (req, res) => {
  res.json(stationService.getServiceCenter());
});

// Home Chargers
app.get('/home-chargers', (req, res) => {
  res.json(stationService.getAllHomeChargers());
});

// Power Grid
app.get('/grid', (req, res) => {
  res.json(energyService.getPowerGrid());
});

// Chargers
app.get('/chargers', (req, res) => {
  const stations = stationService.getAllStations();
  const allChargers = stations.flatMap(s => s.chargers);
  res.json(allChargers);
});

// Vehicles
app.get('/vehicles', (req, res) => {
  res.json(vehicleService.getAllVehicles());
});

app.get('/vehicles/:id', (req, res) => {
  const vehicle = vehicleService.getVehicleById(req.params.id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  res.json(vehicle);
});

// Events & Incidents
app.get('/events', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  res.json(eventService.getEvents(limit));
});

// Energy & KPIs
app.get('/energy', (req, res) => {
  res.json(energyService.getEnergyMetrics());
});

app.get('/kpis', (req, res) => {
  res.json(energyService.getKPIs());
});

// Simulation Interactive Controls
app.post('/simulation/vehicle', (req, res) => {
  const vehicle = vehicleService.spawnVehicle(req.body);
  wsGateway.broadcastVehicleUpdate(vehicle);
  res.status(201).json(vehicle);
});

app.post('/simulation/fault', (req, res) => {
  const { stationCode, chargerCode } = req.body;
  const result = simulationEngine.triggerFault(stationCode, chargerCode);
  if (result?.station) {
    wsGateway.broadcastStationUpdate(result.station);
  }
  res.json({ success: true, result });
});

app.post('/simulation/ev-fault', (req, res) => {
  const { vehicleCode } = req.body;
  const v = simulationEngine.triggerEVFault(vehicleCode || 'EV-024');
  if (v) wsGateway.broadcastVehicleUpdate(v);
  res.json({ success: true, vehicle: v });
});

app.post('/simulation/low-battery', (req, res) => {
  const { vehicleCode, pct } = req.body;
  const v = simulationEngine.triggerLowBattery(vehicleCode || 'EV-024', pct || 18);
  if (v) wsGateway.broadcastVehicleUpdate(v);
  res.json({ success: true, vehicle: v });
});

app.post('/simulation/surge', (req, res) => {
  const { active } = req.body;
  const grid = simulationEngine.triggerEnergySurge(active ?? true);
  res.json({ success: true, grid });
});

app.post('/simulation/service-route', (req, res) => {
  const { vehicleId } = req.body;
  const ok = vehicleService.sendToService(vehicleId || 'veh-ev-024');
  res.json({ success: ok });
});

app.post('/simulation/finish-repair', (req, res) => {
  const { vehicleCode } = req.body;
  const v = simulationEngine.completeActiveRepair(vehicleCode || 'EV-024');
  res.json({ success: true, vehicle: v });
});

app.post('/simulation/return-to-road', (req, res) => {
  const { vehicleCode } = req.body;
  const v = simulationEngine.returnToRoad(vehicleCode || 'EV-024');
  res.json({ success: true, vehicle: v });
});

app.post('/simulation/repair', (req, res) => {
  const { chargerCode } = req.body;
  const result = simulationEngine.repairFault(chargerCode);
  if (result?.station) {
    wsGateway.broadcastStationUpdate(result.station);
  }
  res.json({ success: true, result });
});

app.post('/simulation/reset', (req, res) => {
  simulationEngine.resetSimulation();
  res.json({ success: true, message: 'Simulation reset complete' });
});

app.post('/simulation/speed', (req, res) => {
  const { multiplier } = req.body;
  simulationEngine.setSpeed(typeof multiplier === 'number' ? multiplier : 1.0);
  res.json({ success: true, speed: simulationEngine.getSpeed() });
});

// AI & Queue Optimization
app.get('/recommendations', (req, res) => {
  res.json(aiService.getPendingRecommendations());
});

app.post('/simulation/recommendation/apply', (req, res) => {
  const { id, accept } = req.body;
  const ok = aiService.resolveRecommendation(id, accept);
  res.json({ success: ok });
});

app.post('/ai/query', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query string required' });
  const result = await aiService.handleAssistantQuery(query);
  res.json(result);
});

// Start Engine & Server
server.listen(port, () => {
  console.log(`⚡ EVNEXUS Boisar Backend Server live at http://localhost:${port}`);
  simulationEngine.start();
});
