const express = require('express');
const cors = require('cors');
const dashboardHtml = require('./dashboard');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_LOGS = 30;

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------
// Data storage
// Default: in-memory (may be lost or split across instances on Vercel).
// Optional: Upstash Redis (Vercel Marketplace) -> used automatically
// when the environment variables below are present.
// ------------------------------------------------------------------
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);
const KEY = 'sensor_logs';
let memoryLogs = [];

async function redisPipeline(commands) {
  const res = await fetch(REDIS_URL + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!res.ok) throw new Error('Redis HTTP ' + res.status);
  return res.json();
}

async function saveLog(entry) {
  if (!useRedis) {
    memoryLogs.unshift(entry);
    if (memoryLogs.length > MAX_LOGS) memoryLogs.length = MAX_LOGS;
    return;
  }
  await redisPipeline([
    ['LPUSH', KEY, JSON.stringify(entry)],
    ['LTRIM', KEY, '0', String(MAX_LOGS - 1)]
  ]);
}

async function getLogs() {
  if (!useRedis) return memoryLogs;
  const [r] = await redisPipeline([['LRANGE', KEY, '0', String(MAX_LOGS - 1)]]);
  return (r.result || []).map((s) => JSON.parse(s));
}

// Returns a number, null (not sent), or NaN (sent but invalid)
function optionalNumber(v) {
  if (v === undefined || v === null || v === '') return null;
  return Number(v);
}

// ------------------------------------------------------------------
// API: POST JSON from the ESP32
//   {
//     device_id:  "ESP32-01",
//     suhu:       28.5,   // air temperature (°C)       - DHT22
//     kelembapan: 75.2,   // air humidity (%)           - DHT22
//     soil:       64.0,   // soil moisture (%)          - capacitive sensor
//     soil_raw:   2010    // raw ADC value (optional, for calibration)
//   }
// Every field is optional, but at least one reading must be present,
// so a failed DHT22 does not block soil data (and vice versa).
// ------------------------------------------------------------------
app.post('/api/sensor', async (req, res) => {
  const body = req.body || {};
  const suhu = optionalNumber(body.suhu);
  const kelembapan = optionalNumber(body.kelembapan);
  const soil = optionalNumber(body.soil !== undefined ? body.soil : body.kelembapan_tanah);
  const soilRaw = optionalNumber(body.soil_raw);

  if (suhu === null && kelembapan === null && soil === null) {
    return res.status(400).json({ status: 'error', message: 'No sensor values sent (suhu, kelembapan or soil)' });
  }
  if ([suhu, kelembapan, soil, soilRaw].some((v) => v !== null && Number.isNaN(v))) {
    return res.status(400).json({ status: 'error', message: 'Sensor values must be numbers' });
  }

  const now = Date.now();
  const entry = {
    id: now,
    ts: now,
    device_id: String(body.device_id || 'ESP32-01').slice(0, 40),
    suhu,
    kelembapan,
    soil: soil === null ? null : Math.max(0, Math.min(100, soil)),
    soil_raw: soilRaw,
    waktu: new Date(now).toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta' })
  };

  try {
    await saveLog(entry);
    console.log(`[IN] ${entry.device_id} | Temp: ${entry.suhu}°C | Air: ${entry.kelembapan}% | Soil: ${entry.soil}%`);
    res.status(200).json({ status: 'success', data: entry });
  } catch (err) {
    console.error('Failed to save:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to save data' });
  }
});

app.get('/api/sensor', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    res.json(await getLogs());
  } catch (err) {
    console.error('Failed to read:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to read data' });
  }
});

// TerraTech dashboard
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(dashboardHtml);
});

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} (storage: ${useRedis ? 'Upstash Redis' : 'memory'})`)
);

module.exports = app;
