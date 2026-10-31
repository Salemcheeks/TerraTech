// TerraTech dashboard page, served by server.js on route "/".
// Note: do not use backticks or dollar-curly-brace sequences inside this string.
module.exports = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TerraTech - Decision Support System</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script>
tailwind.config = {
  theme: { extend: {
    fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
    boxShadow: {
      card: '0 2px 12px -2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
      'card-hover': '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)'
    }
  } }
};
</script>
<style>
  .map-grid-bg { background-color:#f1f8f5; background-image:radial-gradient(#10b981 0.8px, transparent 0.8px), radial-gradient(#059669 0.8px, #f1f8f5 0.8px); background-size:28px 28px; background-position:0 0, 14px 14px; }
  @keyframes radar-pulse { 0%{transform:scale(0.9);opacity:0.9} 50%{transform:scale(2.2);opacity:0.25} 100%{transform:scale(3.4);opacity:0} }
  .radar-ping { animation: radar-pulse 2.2s cubic-bezier(0.2,0.8,0.2,1) infinite; }
  .tab-panel { display:none; }
  .tab-panel.active { display:block; animation: fadeUp .3s ease; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  .gauge-arc { transition: stroke-dashoffset .6s ease; }
  @media print { header, footer, .no-print { display:none !important; } .tab-panel { display:block !important; } }
</style>
</head>
<body class="bg-slate-100/80 font-sans text-slate-800 antialiased min-h-screen flex flex-col">

<!-- ================= HEADER ================= -->
<header class="bg-white/95 border-b border-slate-200/80 sticky top-0 z-50 shadow-sm backdrop-blur-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
        <i class="fa-solid fa-earth-asia text-lg"></i>
      </div>
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-lg tracking-tight text-slate-900">TerraTech</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">v1.2 • DSS</span>
        </div>
        <p class="text-[11px] text-slate-400 font-medium truncate">Crop Rotation Decision Support • Soil + Climate Sensors</p>
      </div>
    </div>

    <div class="hidden md:flex items-center gap-3">
      <div class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2.5 text-xs">
        <span class="relative flex h-2.5 w-2.5">
          <span id="live-ping" class="absolute inline-flex h-full w-full rounded-full bg-slate-300 opacity-75"></span>
          <span id="live-dot" class="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
        </span>
        <span id="live-label" class="font-bold text-slate-700">Connecting...</span>
        <span id="live-device" class="text-slate-500 font-mono text-[11px]"></span>
      </div>
      <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-3 py-1.5 text-xs">
        <i class="fa-solid fa-location-dot text-emerald-600"></i>
        <select id="region-select" onchange="updateLocation(this.value)" class="bg-transparent border-none font-bold text-xs outline-none cursor-pointer">
          <option value="kalianda">Kalianda, South Lampung</option>
          <option value="metro">West Metro, Metro City</option>
          <option value="pringsewu">Pringsewu, Pringsewu</option>
          <option value="natar">Natar, South Lampung</option>
        </select>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button onclick="window.print()" class="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
        <i class="fa-solid fa-print"></i> Print
      </button>
      <button id="sync-btn" onclick="manualSync()" class="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition active:scale-95">
        <i id="sync-icon" class="fa-solid fa-rotate"></i><span>Sync</span>
      </button>
    </div>
  </div>

  <div class="bg-white border-t border-slate-100">
    <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex overflow-x-auto">
      <button onclick="switchTab('dashboard')" id="tab-btn-dashboard" class="nav-tab shrink-0 flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 border-emerald-600 text-emerald-700"><i class="fa-solid fa-table-columns"></i><span>Overview</span></button>
      <button onclick="switchTab('map')" id="tab-btn-map" class="nav-tab shrink-0 flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800"><i class="fa-solid fa-map-location-dot"></i><span>Field Map</span></button>
      <button onclick="switchTab('parameters')" id="tab-btn-parameters" class="nav-tab shrink-0 flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800"><i class="fa-solid fa-sliders"></i><span>Parameters</span></button>
      <button onclick="switchTab('recommendation')" id="tab-btn-recommendation" class="nav-tab shrink-0 flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800"><i class="fa-solid fa-calendar-check"></i><span>Rotation Plan</span></button>
    </div>
  </div>
</header>

<main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

<!-- ================= TAB 1: OVERVIEW ================= -->
<section id="tab-dashboard" class="tab-panel active space-y-6">

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

    <!-- Field score -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex items-center gap-4">
      <div class="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 100 100" class="w-24 h-24 -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke-width="10" class="stroke-slate-100"></circle>
          <circle id="gauge-arc" cx="50" cy="50" r="42" fill="none" stroke-width="10" stroke-linecap="round" class="gauge-arc stroke-slate-300" stroke-dasharray="263.9" stroke-dashoffset="263.9"></circle>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span id="score-val" class="text-2xl font-black text-slate-900 leading-none">--</span>
          <span class="text-[9px] font-bold text-slate-400 mt-0.5">/ 100</span>
        </div>
      </div>
      <div class="min-w-0">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400">Field Score</div>
        <span id="score-badge" class="inline-block mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200">Waiting for data</span>
        <p id="score-note" class="text-[11px] text-slate-400 mt-1.5 leading-snug">Combines soil moisture, air humidity and temperature.</p>
      </div>
    </div>

    <!-- Soil moisture -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all">
      <div class="flex items-center justify-between text-xs mb-3">
        <span class="font-bold uppercase tracking-wider text-slate-400">Soil Moisture</span>
        <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center"><i class="fa-solid fa-seedling text-sm"></i></div>
      </div>
      <div class="flex items-baseline gap-2 mb-2 flex-wrap">
        <span id="soil-val" class="text-3xl font-black text-slate-900">--%</span>
        <span id="soil-badge" class="text-xs font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200">No data</span>
      </div>
      <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div id="soil-bar" class="h-full bg-slate-300 rounded-full transition-all duration-500" style="width:0%"></div></div>
      <p id="soil-note" class="text-[11px] text-slate-400 mt-2">Capacitive soil sensor.</p>
    </div>

    <!-- Air humidity -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all">
      <div class="flex items-center justify-between text-xs mb-3">
        <span class="font-bold uppercase tracking-wider text-slate-400">Air Humidity</span>
        <div class="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center"><i class="fa-solid fa-droplet text-sm"></i></div>
      </div>
      <div class="flex items-baseline gap-2 mb-2 flex-wrap">
        <span id="air-val" class="text-3xl font-black text-slate-900">--%</span>
        <span id="air-badge" class="text-xs font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200">No data</span>
      </div>
      <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div id="air-bar" class="h-full bg-slate-300 rounded-full transition-all duration-500" style="width:0%"></div></div>
      <p id="air-note" class="text-[11px] text-slate-400 mt-2">DHT22 sensor.</p>
    </div>

    <!-- Temperature -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all">
      <div class="flex items-center justify-between text-xs mb-3">
        <span class="font-bold uppercase tracking-wider text-slate-400">Temperature</span>
        <div class="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><i class="fa-solid fa-temperature-half text-sm"></i></div>
      </div>
      <div class="flex items-baseline gap-2 mb-2 flex-wrap">
        <span id="temp-val" class="text-3xl font-black text-slate-900">-- °C</span>
        <span id="temp-badge" class="text-xs font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200">No data</span>
      </div>
      <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div id="temp-bar" class="h-full bg-slate-300 rounded-full transition-all duration-500" style="width:0%"></div></div>
      <p id="temp-note" class="text-[11px] text-slate-400 mt-2">Range of recent readings: -</p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">

      <!-- Score breakdown -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-5">
          <div>
            <h3 class="font-extrabold text-base text-slate-900">Field Score Breakdown</h3>
            <p class="text-xs text-slate-500">Each reading gets a 0-100 sub-score, then a weighted average: soil 50%, temperature 30%, air humidity 20%.</p>
          </div>
          <span id="limit-factor" class="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full self-start whitespace-nowrap">-</span>
        </div>
        <div id="score-breakdown" class="space-y-4"></div>
        <details class="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <summary class="cursor-pointer font-bold text-slate-600">How the sub-scores are calculated</summary>
          <div class="grid sm:grid-cols-3 gap-3 mt-3">
            <div class="bg-slate-50 rounded-xl p-3"><div class="font-bold text-slate-700 mb-1">Soil moisture</div>100 at 60-80%.<br>Falls to 0 at 20% (dry).<br>Falls to 40 at 100% (waterlogged).</div>
            <div class="bg-slate-50 rounded-xl p-3"><div class="font-bold text-slate-700 mb-1">Temperature</div>100 at 22-30 &deg;C.<br>Falls to 0 at 15 &deg;C (cold).<br>Falls to 0 at 40 &deg;C (heat stress).</div>
            <div class="bg-slate-50 rounded-xl p-3"><div class="font-bold text-slate-700 mb-1">Air humidity</div>100 at 60-80%.<br>Falls to 20 at 30% (dry air).<br>Falls to 30 at 100% (fungal risk).</div>
          </div>
          <p class="mt-3">Grades: 85+ Excellent • 70-84 Good • 50-69 Fair • 30-49 Poor • below 30 Critical. A missing sensor is left out and the other weights are scaled up.</p>
        </details>
      </div>

      <!-- Trend -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 class="font-extrabold text-base text-slate-900">Real-time Trend</h3>
            <p class="text-xs text-slate-500">Latest readings from the field sensor node.</p>
          </div>
          <div id="trend-tabs" class="flex flex-wrap gap-1.5"></div>
        </div>
        <div id="trend-chart" class="h-48 bg-slate-50 border border-slate-100 rounded-xl p-4 pr-28 flex items-end justify-between gap-1.5 sm:gap-3 relative"></div>
        <div class="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span><i class="fa-solid fa-circle-info text-emerald-500 mr-1"></i><span id="trend-note">Waiting for sensor data.</span></span>
          <span id="trend-status" class="font-bold text-slate-500">-</span>
        </div>
      </div>

      <!-- Log -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-extrabold text-base text-slate-900">Sensor Telemetry Log</h3>
            <p class="text-xs text-slate-500">10 most recent readings • auto-refreshes every 3 seconds</p>
          </div>
          <span id="log-count" class="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">0 readings</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead><tr class="text-left text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <th class="py-2 pr-4 font-bold">Time (WIB)</th><th class="py-2 pr-4 font-bold">Device</th><th class="py-2 pr-4 font-bold">Soil</th><th class="py-2 pr-4 font-bold">Air Hum.</th><th class="py-2 pr-4 font-bold">Temp</th><th class="py-2 font-bold">Score</th>
            </tr></thead>
            <tbody id="log-body"><tr><td colspan="6" class="py-6 text-center text-slate-400">No data received yet.</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <!-- Recommendation -->
      <div class="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-card">
        <div class="flex items-center justify-between text-emerald-200 text-xs mb-2">
          <span class="font-bold uppercase tracking-wider">Top Recommendation</span><i class="fa-solid fa-star text-sm"></i>
        </div>
        <div id="rec-main" class="text-2xl font-black tracking-tight">-</div>
        <p id="rec-main-note" class="text-xs text-emerald-100 mt-1">-</p>
        <button onclick="switchTab('recommendation')" class="mt-4 w-full bg-white/20 hover:bg-white/30 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5">
          <span>View Rotation Timeline</span><i class="fa-solid fa-arrow-right text-[10px]"></i>
        </button>
      </div>

      <!-- Alerts -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <h3 class="font-extrabold text-base text-slate-900 mb-3">Field Condition Alerts</h3>
        <div id="alerts" class="space-y-3"></div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-400">Last reading:</span>
          <span id="last-feed" class="font-bold text-slate-700">-</span>
        </div>
      </div>

      <!-- Current crop -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-extrabold text-base text-slate-900">Current Crop</h3>
          <button onclick="switchTab('parameters')" class="text-xs text-emerald-600 font-bold hover:underline">Change</button>
        </div>
        <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5 mb-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0"><i id="active-icon" class="fa-solid fa-seedling"></i></div>
          <div>
            <div id="active-name" class="font-extrabold text-sm text-emerald-950">-</div>
            <div id="active-ket" class="text-xs text-emerald-700 mt-0.5">-</div>
          </div>
        </div>
        <div class="space-y-2.5 text-xs text-slate-600">
          <div class="flex justify-between gap-3 py-1 border-b border-slate-100"><span class="text-slate-400">Priorities:</span><span id="active-prio" class="font-bold text-slate-800 text-right">-</span></div>
          <div class="flex justify-between gap-3 py-1 border-b border-slate-100"><span class="text-slate-400">Family:</span><span id="active-fam" class="font-bold text-slate-800">-</span></div>
          <div class="flex justify-between gap-3 py-1"><span class="text-slate-400">Next:</span><span id="active-next" class="font-bold text-emerald-600 text-right">-</span></div>
        </div>
      </div>

      <!-- Satellite (static) -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
        <div class="flex items-center justify-between text-xs mb-3">
          <span class="font-bold uppercase tracking-wider text-slate-400">Climate Indices (MERRA-2)</span>
          <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><i class="fa-solid fa-satellite text-sm"></i></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><div class="text-2xl font-black text-slate-900">4</div><div class="text-[11px] font-semibold text-slate-500">CDD (dry days)</div></div>
          <div><div class="text-2xl font-black text-slate-900">3</div><div class="text-[11px] font-semibold text-slate-500">CWD (wet days)</div></div>
        </div>
        <p class="text-[11px] text-slate-400 mt-2">Static satellite data • statM_2d_edi_Nx</p>
      </div>
    </div>
  </div>
</section>

<!-- ================= TAB 2: MAP ================= -->
<section id="tab-map" class="tab-panel space-y-6">
  <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
    <div class="mb-4">
      <h2 class="text-lg font-extrabold text-slate-900">Field Map</h2>
      <p class="text-xs text-slate-500">Active field location, colored by the current field score.</p>
    </div>
    <div class="h-[460px] map-grid-bg rounded-2xl border border-slate-200 relative overflow-hidden flex items-center justify-center shadow-inner">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#0596691a_1px,transparent_1px),linear-gradient(to_bottom,#0596691a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div class="absolute top-4 left-4 bg-white/95 p-3.5 rounded-2xl border border-slate-200 shadow-md text-xs space-y-1.5 max-w-[250px] z-20">
        <div class="font-extrabold text-slate-800 flex items-center gap-1.5"><i class="fa-solid fa-microchip text-emerald-600"></i>Field Sensor Node</div>
        <div class="text-[11px] text-slate-500 leading-snug">
          Device: <span id="map-device" class="font-semibold text-slate-700">-</span><br>
          Field score: <span id="map-score" class="font-semibold text-slate-700">-</span><br>
          Soil moisture: <span id="map-soil" class="font-semibold text-slate-700">-</span><br>
          Air humidity: <span id="map-air" class="font-semibold text-slate-700">-</span><br>
          Temperature: <span id="map-temp" class="font-semibold text-slate-700">-</span>
        </div>
      </div>

      <div class="absolute top-4 right-4 bg-slate-900/80 text-white px-3 py-1 rounded-full text-[11px] font-mono z-20" id="map-coord">-</div>

      <div class="relative flex flex-col items-center justify-center z-10">
        <div id="map-ring" class="absolute w-32 h-32 rounded-full bg-emerald-500/20 radar-ping"></div>
        <div id="map-pin" class="w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center justify-center text-xl"><i class="fa-solid fa-location-dot"></i></div>
        <div id="map-label" class="mt-2 bg-slate-900/90 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg">-</div>
      </div>

      <div class="absolute bottom-4 left-4 right-4 bg-white/95 p-3.5 rounded-2xl border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-3 z-20">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold">
          <span class="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Field score:</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500"></span>Excellent (85+)</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-lime-500"></span>Good (70-84)</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-yellow-400"></span>Fair (50-69)</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-500"></span>Poor (30-49)</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500"></span>Critical (&lt;30)</span>
        </div>
        <button onclick="switchTab('parameters')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition">Use This Location <i class="fa-solid fa-arrow-right ml-1"></i></button>
      </div>
    </div>
  </div>
</section>

<!-- ================= TAB 3: PARAMETERS ================= -->
<section id="tab-parameters" class="tab-panel space-y-6">
  <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-card">
    <div class="border-b border-slate-100 pb-5 mb-6">
      <h2 class="text-lg font-extrabold text-slate-900">Field Parameters</h2>
      <p class="text-xs text-slate-500">Choose the last crop and your rotation priorities. The recommendation is recalculated with the latest sensor data.</p>
    </div>

    <div class="mb-8">
      <label class="font-extrabold text-sm text-slate-900 flex items-center gap-2 mb-4">
        <span class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">1</span>Last / Current Crop
      </label>
      <div id="crop-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"></div>
    </div>

    <div class="mb-8">
      <div class="flex items-center justify-between mb-4 gap-2">
        <label class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>Rotation Priorities
        </label>
        <span class="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">Multi-select</span>
      </div>
      <div id="prio-grid" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
    </div>

    <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
      <button onclick="switchTab('dashboard')" class="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
      <button onclick="renderAll(); switchTab('recommendation')" class="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md transition active:scale-95 flex items-center gap-2">
        <span>Calculate Rotation Plan</span><i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  </div>
</section>

<!-- ================= TAB 4: ROTATION PLAN ================= -->
<section id="tab-recommendation" class="tab-panel space-y-6">
  <div class="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold mb-3 border border-white/20">
        <i class="fa-solid fa-wand-magic-sparkles"></i>Recommendation
      </div>
      <h2 class="text-2xl sm:text-3xl font-black tracking-tight">3-Stage Rotation Plan</h2>
      <p id="rec-summary" class="text-sm text-emerald-100/90 mt-1 max-w-2xl">-</p>
    </div>
    <button onclick="window.print()" class="no-print px-5 py-3 text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl shadow-lg transition flex items-center gap-2 self-start md:self-auto">
      <i class="fa-solid fa-download"></i> Export PDF
    </button>
  </div>

  <div id="rec-metrics" class="grid grid-cols-1 sm:grid-cols-3 gap-4"></div>
  <div id="rec-timeline" class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6"></div>
</section>

</main>

<footer class="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
    <div><span class="font-extrabold text-slate-800">TerraTech DSS</span> • ESP32 Soil &amp; Climate Sensors + NASA MERRA-2 Satellite Data</div>
    <div>Target Region: Lampung Province, Indonesia</div>
  </div>
</footer>

<script>
var API = '/api/sensor';
var POLL_MS = 3000;
var ONLINE_WINDOW_S = 60;

// ---------- scoring configuration (edit to tune) ----------
var WEIGHTS = { soil: 0.5, temp: 0.3, air: 0.2 };

var REGIONS = {
  kalianda:  { short: 'Kalianda',   lat: -5.722, lon: 105.589 },
  metro:     { short: 'West Metro', lat: -5.117, lon: 105.300 },
  pringsewu: { short: 'Pringsewu',  lat: -5.358, lon: 104.974 },
  natar:     { short: 'Natar',      lat: -5.315, lon: 105.205 }
};

var CROPS = {
  Terong: { nama: 'Eggplant', latin: 'Solanum melongena', famili: 'Solanaceae', akar: 'deep', akarCm: '40 - 60 cm', hari: [90, 120], air: 'medium', tahanKering: false, tahanPanas: true, beratHara: true, legum: false, icon: 'fa-seedling', ket: 'Deep Roots • Heavy Feeder' },
  Sawi:   { nama: 'Mustard Greens', latin: 'Brassica rapa', famili: 'Brassicaceae', akar: 'shallow', akarCm: '10 - 20 cm', hari: [30, 40], air: 'medium', tahanKering: false, tahanPanas: false, beratHara: false, legum: false, icon: 'fa-leaf', ket: 'Shallow Roots • Fast Harvest' },
  Selada: { nama: 'Lettuce', latin: 'Lactuca sativa', famili: 'Asteraceae', akar: 'shallow', akarCm: '10 - 20 cm', hari: [35, 45], air: 'high', tahanKering: false, tahanPanas: false, beratHara: false, legum: false, icon: 'fa-leaf', ket: 'Shallow Roots • Needs Water' },
  Bayam:  { nama: 'Amaranth Spinach', latin: 'Amaranthus spp.', famili: 'Amaranthaceae', akar: 'shallow', akarCm: '15 - 25 cm', hari: [25, 35], air: 'medium', tahanKering: false, tahanPanas: true, beratHara: true, legum: false, icon: 'fa-plant-wilt', ket: 'High Nitrogen Demand' },
  Cabai:  { nama: "Bird's Eye Chili", latin: 'Capsicum frutescens', famili: 'Solanaceae', akar: 'deep', akarCm: '30 - 50 cm', hari: [90, 120], air: 'low', tahanKering: true, tahanPanas: true, beratHara: true, legum: false, icon: 'fa-pepper-hot', ket: 'Moderately Drought Tolerant' },
  Jagung: { nama: 'Sweet Corn', latin: 'Zea mays saccharata', famili: 'Poaceae', akar: 'deep', akarCm: '60 - 90 cm', hari: [70, 85], air: 'medium', tahanKering: true, tahanPanas: true, beratHara: true, legum: false, icon: 'fa-wheat-awn', ket: 'Heavy Biomass' },
  Kacang: { nama: 'Peanut', latin: 'Arachis hypogaea', famili: 'Fabaceae', akar: 'medium', akarCm: '30 - 40 cm', hari: [90, 110], air: 'low', tahanKering: true, tahanPanas: true, beratHara: false, legum: true, icon: 'fa-seedling', ket: 'Legume • Nitrogen Fixing', hanyaKandidat: true }
};

var PRIORITIES = [
  { key: 'air',   icon: 'fa-droplet',     title: 'Water Efficiency',        desc: 'Favor drought-tolerant crops when soil moisture drops.' },
  { key: 'cepat', icon: 'fa-bolt',        title: 'Fast Harvest',            desc: 'Favor crops that can be harvested in under 45 days.' },
  { key: 'tanah', icon: 'fa-arrows-spin', title: 'Soil Health & Structure', desc: 'Alternate root depth and plant family, and add nitrogen-fixing legumes.' }
];

var AIR_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };

var TONE = {
  slate:   { badge: 'bg-slate-100 text-slate-600 border-slate-200', bar: 'bg-slate-300', pin: 'bg-slate-500', ring: 'bg-slate-400/20', text: 'text-slate-500', stroke: 'stroke-slate-300' },
  red:     { badge: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500', pin: 'bg-red-600', ring: 'bg-red-500/20', text: 'text-red-700', stroke: 'stroke-red-500' },
  amber:   { badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500', pin: 'bg-amber-500', ring: 'bg-amber-400/20', text: 'text-amber-700', stroke: 'stroke-amber-500' },
  yellow:  { badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', bar: 'bg-yellow-400', pin: 'bg-yellow-500', ring: 'bg-yellow-400/20', text: 'text-yellow-700', stroke: 'stroke-yellow-400' },
  lime:    { badge: 'bg-lime-50 text-lime-700 border-lime-200', bar: 'bg-lime-500', pin: 'bg-lime-600', ring: 'bg-lime-500/20', text: 'text-lime-700', stroke: 'stroke-lime-500' },
  emerald: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', pin: 'bg-emerald-600', ring: 'bg-emerald-500/20', text: 'text-emerald-700', stroke: 'stroke-emerald-500' },
  sky:     { badge: 'bg-sky-50 text-sky-700 border-sky-200', bar: 'bg-sky-500', pin: 'bg-sky-600', ring: 'bg-sky-500/20', text: 'text-sky-700', stroke: 'stroke-sky-500' },
  blue:    { badge: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-600', pin: 'bg-blue-700', ring: 'bg-blue-500/20', text: 'text-blue-700', stroke: 'stroke-blue-600' }
};

var state = { logs: [], crop: 'Terong', pr: { air: true, cepat: false, tanah: true }, region: 'kalianda', error: false, trend: null };

// ---------- utils ----------
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function has(v) { return v !== null && v !== undefined && !isNaN(v); }
function num(v) { return has(v) ? Number(v) : null; }
function fmt(v) { return has(v) ? Math.round(Number(v) * 10) / 10 : '-'; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(x, x0, x1, y0, y1) { return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
function latest() { return state.logs.length ? state.logs[0] : null; }
function ageSeconds(r) { var t = r.ts || r.id; return t ? Math.max(0, Math.round((Date.now() - t) / 1000)) : null; }
function ageText(s) {
  if (s == null) return '-';
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s / 60) + ' min ago';
  return Math.floor(s / 3600) + ' h ago';
}

// ---------- status per reading ----------
function soilStatus(v) {
  if (!has(v)) return { label: 'No data', tone: 'slate', note: 'No soil sensor data. Set USE_SOIL_SENSOR to 1 on the ESP32.' };
  if (v < 20) return { label: 'Critically Dry', tone: 'red', note: 'Root zone is dry. Irrigate before planting.' };
  if (v < 40) return { label: 'Dry', tone: 'amber', note: 'Irrigation needed for most crops.' };
  if (v < 60) return { label: 'Slightly Dry', tone: 'yellow', note: 'Plantable; drought-tolerant crops do best.' };
  if (v <= 80) return { label: 'Optimal', tone: 'emerald', note: 'Ideal root-zone moisture for planting.' };
  if (v <= 90) return { label: 'Wet', tone: 'sky', note: 'Moist soil; avoid extra irrigation.' };
  return { label: 'Saturated', tone: 'blue', note: 'Waterlogging risk; check drainage.' };
}
function airStatus(v) {
  if (!has(v)) return { label: 'No data', tone: 'slate', note: 'No DHT22 humidity data.' };
  if (v < 40) return { label: 'Very Dry Air', tone: 'amber', note: 'High evaporation; soil dries out fast.' };
  if (v < 60) return { label: 'Dry Air', tone: 'yellow', note: 'Moderate evaporation.' };
  if (v <= 80) return { label: 'Ideal', tone: 'emerald', note: 'Comfortable range for most crops.' };
  if (v <= 90) return { label: 'Humid', tone: 'sky', note: 'Watch for fungal leaf disease.' };
  return { label: 'Very Humid', tone: 'blue', note: 'High fungal disease risk; improve air flow.' };
}
function tempStatus(v) {
  if (!has(v)) return { label: 'No data', tone: 'slate', note: 'No DHT22 temperature data.' };
  if (v < 15) return { label: 'Cold', tone: 'blue', note: 'Too cold for most tropical crops.' };
  if (v < 22) return { label: 'Cool', tone: 'sky', note: 'Growth slows below 22 °C.' };
  if (v <= 30) return { label: 'Ideal', tone: 'emerald', note: 'Ideal tropical growing range.' };
  if (v <= 35) return { label: 'Hot', tone: 'amber', note: 'Leafy greens may wilt.' };
  return { label: 'Extreme Heat', tone: 'red', note: 'Heat stress; add shade and water.' };
}

// ---------- sub-scores (0-100) ----------
function scoreSoil(v) {
  if (!has(v)) return null;
  if (v <= 20) return 0;
  if (v < 60) return lerp(v, 20, 60, 0, 100);
  if (v <= 80) return 100;
  return lerp(clamp(v, 80, 100), 80, 100, 100, 40);
}
function scoreAir(v) {
  if (!has(v)) return null;
  if (v <= 30) return 20;
  if (v < 60) return lerp(v, 30, 60, 20, 100);
  if (v <= 80) return 100;
  return lerp(clamp(v, 80, 100), 80, 100, 100, 30);
}
function scoreTemp(v) {
  if (!has(v)) return null;
  if (v <= 15 || v >= 40) return 0;
  if (v < 22) return lerp(v, 15, 22, 0, 100);
  if (v <= 30) return 100;
  return lerp(v, 30, 40, 100, 0);
}
function grade(s) {
  if (s == null) return { label: 'Waiting for data', tone: 'slate' };
  if (s >= 85) return { label: 'Excellent', tone: 'emerald' };
  if (s >= 70) return { label: 'Good', tone: 'lime' };
  if (s >= 50) return { label: 'Fair', tone: 'yellow' };
  if (s >= 30) return { label: 'Poor', tone: 'amber' };
  return { label: 'Critical', tone: 'red' };
}
function fieldScore(r) {
  var parts = [
    { key: 'soil', label: 'Soil Moisture', icon: 'fa-seedling',        v: r ? num(r.soil) : null,       unit: '%',   s: scoreSoil(r ? num(r.soil) : null),       w: WEIGHTS.soil, st: soilStatus(r ? num(r.soil) : null) },
    { key: 'temp', label: 'Temperature',   icon: 'fa-temperature-half', v: r ? num(r.suhu) : null,       unit: ' °C', s: scoreTemp(r ? num(r.suhu) : null),       w: WEIGHTS.temp, st: tempStatus(r ? num(r.suhu) : null) },
    { key: 'air',  label: 'Air Humidity',  icon: 'fa-droplet',          v: r ? num(r.kelembapan) : null, unit: '%',   s: scoreAir(r ? num(r.kelembapan) : null),  w: WEIGHTS.air,  st: airStatus(r ? num(r.kelembapan) : null) }
  ];
  var wSum = 0, total = 0, count = 0;
  parts.forEach(function (p) { if (p.s != null) { wSum += p.w; total += p.s * p.w; count++; } });
  var score = wSum > 0 ? Math.round(total / wSum) : null;
  parts.forEach(function (p) { p.effW = (p.s != null && wSum > 0) ? p.w / wSum : 0; });
  var limiting = null;
  parts.forEach(function (p) { if (p.s != null && p.s < 100 && (!limiting || p.s < limiting.s)) limiting = p; });
  return { score: score, grade: grade(score), parts: parts, limiting: limiting, count: count, partial: count > 0 && count < parts.length };
}

// ---------- rotation rule engine ----------
// Water context uses soil moisture when available, otherwise air humidity.
function scoreCrop(c, prev, ctx) {
  var s = 0, alasan = [];
  if (c.famili === prev.famili) { s -= 10; }
  else { s += 3; alasan.push('Different family from ' + prev.nama + ' (' + prev.famili + ' &rarr; ' + c.famili + '), breaking soil pest and pathogen cycles.'); }
  if (c.akar !== prev.akar) { s += ctx.pr.tanah ? 3 : 1; alasan.push('Alternating root depth (' + prev.akar + ' &rarr; ' + c.akar + ') lets a different soil layer recover.'); }
  if (ctx.pr.tanah && c.legum && prev.beratHara) { s += 3; alasan.push('Legume fixes nitrogen after a heavy-feeding crop.'); }
  if (ctx.pr.tanah && c.beratHara && prev.beratHara) s -= 2;
  if (ctx.pr.cepat) {
    if (c.hari[1] <= 45) { s += 3; alasan.push('Fast harvest (' + c.hari[0] + '-' + c.hari[1] + ' days) for quick capital turnover.'); }
    else s -= 1;
  }
  var srcLabel = ctx.wSrc === 'soil' ? 'soil moisture' : 'air humidity';
  if (ctx.w != null) {
    if (ctx.w < 40) {
      if (c.tahanKering) { s += ctx.pr.air ? 3 : 1; alasan.push('Drought tolerant, suited to the current ' + srcLabel + ' of ' + fmt(ctx.w) + '%.'); }
      if (c.air === 'high') s -= ctx.pr.air ? 3 : 1;
    } else if (ctx.w < 60) {
      if (c.tahanKering) { s += ctx.pr.air ? 2 : 1; alasan.push('Handles the slightly dry ' + srcLabel + ' (' + fmt(ctx.w) + '%) with little irrigation.'); }
      if (c.air === 'high') s -= 1;
    } else if (ctx.w <= 90) {
      if (c.air !== 'low') { s += 1; alasan.push('Current ' + srcLabel + ' of ' + fmt(ctx.w) + '% supports it without intensive irrigation.'); }
    } else {
      if (c.tahanKering) s -= 1;
    }
  } else if (ctx.pr.air && c.tahanKering) {
    s += 1;
  }
  if (ctx.t != null && ctx.t > 32) {
    if (c.tahanPanas) { s += 1; alasan.push('Tolerates high temperature (' + fmt(ctx.t) + ' &deg;C).'); }
    else s -= 2;
  }
  return { s: s, alasan: alasan };
}

function waterContext(r) {
  if (r && has(r.soil)) return { w: Number(r.soil), wSrc: 'soil' };
  if (r && has(r.kelembapan)) return { w: Number(r.kelembapan), wSrc: 'air' };
  return { w: null, wSrc: null };
}

function buildPlan() {
  var prev = CROPS[state.crop];
  var used = {}; used[state.crop] = true;
  var last = latest();
  var wc = waterContext(last);
  var plan = [];
  for (var i = 0; i < 3; i++) {
    var ctx = { pr: state.pr, w: i === 0 ? wc.w : null, wSrc: wc.wSrc, t: (i === 0 && last) ? num(last.suhu) : null };
    var best = null;
    Object.keys(CROPS).forEach(function (k) {
      if (used[k]) return;
      var r = scoreCrop(CROPS[k], prev, ctx);
      if (!best || r.s > best.s) best = { key: k, s: r.s, alasan: r.alasan };
    });
    used[best.key] = true;
    plan.push(best);
    prev = CROPS[best.key];
  }
  return plan;
}

// ---------- render: live ----------
function setMetric(prefix, value, unit, status, barPct, note) {
  var t = TONE[status.tone];
  $(prefix + '-val').textContent = has(value) ? fmt(value) + unit : '--' + unit;
  $(prefix + '-badge').className = 'text-xs font-bold px-2 py-0.5 rounded-full border ' + t.badge;
  $(prefix + '-badge').textContent = status.label;
  $(prefix + '-bar').className = 'h-full rounded-full transition-all duration-500 ' + t.bar;
  $(prefix + '-bar').style.width = (has(value) ? clamp(barPct, 0, 100) : 0) + '%';
  $(prefix + '-note').textContent = note;
}

function renderLive() {
  var last = latest();
  var age = last ? ageSeconds(last) : null;
  var online = last && age != null && age <= ONLINE_WINDOW_S;

  $('live-ping').className = 'absolute inline-flex h-full w-full rounded-full opacity-75 ' + (online ? 'bg-emerald-400 animate-ping' : (state.error ? 'bg-red-400' : 'bg-slate-300'));
  $('live-dot').className = 'relative inline-flex rounded-full h-2.5 w-2.5 ' + (online ? 'bg-emerald-500' : (state.error ? 'bg-red-500' : 'bg-slate-400'));
  $('live-label').textContent = state.error ? 'Server unreachable' : (online ? 'ESP32 Live' : (last ? 'ESP32 Offline' : 'Waiting for ESP32'));
  $('live-device').textContent = last ? last.device_id + ' • ' + ageText(age) : '';

  var soil = last ? num(last.soil) : null;
  var air = last ? num(last.kelembapan) : null;
  var temp = last ? num(last.suhu) : null;

  var ss = soilStatus(soil), as = airStatus(air), ts = tempStatus(temp);
  setMetric('soil', soil, '%', ss, soil, ss.note + (last && has(last.soil_raw) ? ' (raw ' + last.soil_raw + ')' : ''));
  setMetric('air', air, '%', as, air, as.note);
  var temps = state.logs.map(function (r) { return num(r.suhu); }).filter(has);
  setMetric('temp', temp, ' °C', ts, has(temp) ? temp / 45 * 100 : 0,
    temps.length ? 'Range of last ' + temps.length + ': ' + fmt(Math.min.apply(null, temps)) + ' - ' + fmt(Math.max.apply(null, temps)) + ' °C' : ts.note);

  var fs = fieldScore(last);
  renderScore(fs);

  $('last-feed').textContent = last ? last.waktu + ' WIB (' + ageText(age) + ')' : '-';

  // Map
  var gt = TONE[fs.grade.tone];
  $('map-device').textContent = last ? last.device_id : '-';
  $('map-score').textContent = fs.score == null ? '-' : fs.score + ' (' + fs.grade.label + ')';
  $('map-soil').textContent = has(soil) ? fmt(soil) + '% (' + ss.label + ')' : '-';
  $('map-air').textContent = has(air) ? fmt(air) + '% (' + as.label + ')' : '-';
  $('map-temp').textContent = has(temp) ? fmt(temp) + ' °C (' + ts.label + ')' : '-';
  $('map-pin').className = 'w-12 h-12 rounded-2xl text-white shadow-xl flex items-center justify-center text-xl ' + gt.pin;
  $('map-ring').className = 'absolute w-32 h-32 rounded-full radar-ping ' + gt.ring;

  renderTrend();
  renderLog();
  renderAlerts(soil, air, temp, online, last, fs);
}

function renderScore(fs) {
  var t = TONE[fs.grade.tone];
  var C = 263.9;
  $('score-val').textContent = fs.score == null ? '--' : fs.score;
  $('gauge-arc').setAttribute('class', 'gauge-arc ' + t.stroke);
  $('gauge-arc').setAttribute('stroke-dashoffset', fs.score == null ? C : C * (1 - fs.score / 100));
  $('score-badge').className = 'inline-block mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full border ' + t.badge;
  $('score-badge').textContent = fs.grade.label;
  $('score-note').textContent = fs.score == null ? 'Combines soil moisture, air humidity and temperature.'
    : (fs.partial ? 'Partial: based on ' + fs.count + ' of 3 sensors. ' : '') + (fs.limiting ? 'Held back by ' + fs.limiting.label.toLowerCase() + ' (' + fs.limiting.st.label.toLowerCase() + ').' : 'All readings in the ideal range.');

  $('limit-factor').textContent = fs.score == null ? '-' : (fs.limiting ? 'Limiting factor: ' + fs.limiting.label : 'No limiting factor');

  $('score-breakdown').innerHTML = fs.parts.map(function (p) {
    var pt = TONE[p.st.tone];
    if (p.s == null) {
      return '<div class="flex items-center gap-3 opacity-60"><div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0"><i class="fa-solid ' + p.icon + '"></i></div>' +
        '<div class="flex-grow"><div class="flex justify-between text-xs"><span class="font-bold text-slate-700">' + p.label + '</span><span class="text-slate-400">Not reported • weight ' + Math.round(p.w * 100) + '%</span></div>' +
        '<div class="w-full h-2 bg-slate-100 rounded-full mt-1.5"></div></div></div>';
    }
    return '<div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ' + pt.badge + ' border"><i class="fa-solid ' + p.icon + '"></i></div>' +
      '<div class="flex-grow min-w-0"><div class="flex flex-wrap justify-between gap-x-3 text-xs">' +
      '<span><span class="font-bold text-slate-800">' + p.label + '</span> <span class="text-slate-500">' + fmt(p.v) + p.unit + ' • ' + p.st.label + '</span></span>' +
      '<span class="text-slate-500"><span class="font-black text-slate-900">' + Math.round(p.s) + '</span>/100 &times; ' + Math.round(p.effW * 100) + '% = <span class="font-bold text-slate-800">' + fmt(p.s * p.effW) + '</span> pts</span></div>' +
      '<div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5"><div class="h-full rounded-full transition-all duration-500 ' + pt.bar + '" style="width:' + Math.round(p.s) + '%"></div></div></div></div>';
  }).join('');
}

// ---------- render: trend ----------
var TRENDS = {
  soil:  { label: 'Soil', unit: '%', max: 100, line: 60, lineLabel: 'Optimal from 60%', get: function (r) { return num(r.soil); }, status: soilStatus },
  air:   { label: 'Air Hum.', unit: '%', max: 100, line: 60, lineLabel: 'Ideal from 60%', get: function (r) { return num(r.kelembapan); }, status: airStatus },
  temp:  { label: 'Temp', unit: '°', max: 45, line: 30, lineLabel: 'Ideal max 30 °C', get: function (r) { return num(r.suhu); }, status: tempStatus },
  score: { label: 'Score', unit: '', max: 100, line: 70, lineLabel: 'Good from 70', get: function (r) { return fieldScore(r).score; }, status: function (v) { return grade(v); } }
};

function setTrend(k) { state.trend = k; try { localStorage.setItem('terratech-trend', k); } catch (e) {} renderTrend(); }

function renderTrend() {
  if (!state.trend && state.logs.length) state.trend = state.logs.some(function (r) { return has(r.soil); }) ? 'soil' : 'air';
  if (!state.trend) state.trend = 'soil';
  var cfg = TRENDS[state.trend];

  $('trend-tabs').innerHTML = Object.keys(TRENDS).map(function (k) {
    var on = k === state.trend;
    return '<button onclick="setTrend(\'' + k + '\')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ' + (on ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') + '">' + TRENDS[k].label + '</button>';
  }).join('');

  var box = $('trend-chart');
  var n = window.innerWidth < 640 ? 6 : 12;
  var data = state.logs.slice(0, n).reverse().map(function (r) { return { r: r, v: cfg.get(r) }; }).filter(function (d) { return has(d.v); });
  if (!data.length) {
    box.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-xs text-slate-400"><i class="fa-solid fa-satellite-dish mr-2"></i>No ' + cfg.label.toLowerCase() + ' data yet...</div>';
    $('trend-note').textContent = 'Waiting for sensor data.';
    $('trend-status').textContent = '-';
    $('trend-status').className = 'font-bold text-slate-500';
    return;
  }
  var BAR_MAX = 110;
  var html = '<div class="absolute left-4 right-4 border-b border-dashed border-emerald-400 z-0 flex justify-end" style="bottom:' + (32 + cfg.line / cfg.max * BAR_MAX) + 'px"><span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded -translate-y-2">' + cfg.lineLabel + '</span></div>';
  data.forEach(function (d, i) {
    var isLast = i === data.length - 1;
    var hgt = Math.max(4, clamp(d.v, 0, cfg.max) / cfg.max * BAR_MAX);
    var t = TONE[cfg.status(d.v).tone];
    html += '<div class="flex flex-col items-center justify-end gap-1 flex-1 h-full z-10 min-w-0">' +
      '<span class="text-[10px] font-bold ' + (isLast ? 'text-emerald-800 bg-emerald-100 px-1 rounded' : 'text-slate-500') + '">' + fmt(d.v) + cfg.unit + '</span>' +
      '<div class="w-full max-w-[40px] rounded-t-lg transition-all ' + t.bar + (isLast ? ' shadow-md' : '') + '" style="height:' + hgt + 'px" title="' + esc(d.r.waktu) + '"></div>' +
      '<span class="text-[9px] font-semibold ' + (isLast ? 'text-emerald-800' : 'text-slate-400') + ' truncate max-w-full">' + esc(String(d.r.waktu).slice(0, 5)) + '</span></div>';
  });
  box.innerHTML = html;

  var avg = data.reduce(function (a, d) { return a + d.v; }, 0) / data.length;
  var diff = data.length > 1 ? data[data.length - 1].v - data[0].v : 0;
  var arah = Math.abs(diff) < 1 ? 'stable' : (diff > 0 ? 'up ' + fmt(diff) : 'down ' + fmt(Math.abs(diff)));
  var st = cfg.status(avg);
  $('trend-note').textContent = 'Average of ' + data.length + ' readings: ' + fmt(avg) + cfg.unit + ', trend ' + arah + '.';
  $('trend-status').textContent = 'Status: ' + st.label;
  $('trend-status').className = 'font-bold ' + TONE[st.tone].text;
}

// ---------- render: log ----------
function cell(v, unit, st) {
  if (!has(v)) return '<td class="py-2 pr-4 text-slate-300">-</td>';
  return '<td class="py-2 pr-4"><span class="font-semibold ' + TONE[st.tone].text + '">' + fmt(v) + unit + '</span></td>';
}
function renderLog() {
  var rows = state.logs.slice(0, 10);
  $('log-count').textContent = state.logs.length + (state.logs.length === 1 ? ' reading' : ' readings');
  if (!rows.length) { $('log-body').innerHTML = '<tr><td colspan="6" class="py-6 text-center text-slate-400">No data received yet.</td></tr>'; return; }
  $('log-body').innerHTML = rows.map(function (r, i) {
    var fs = fieldScore(r);
    return '<tr class="border-b border-slate-50 ' + (i === 0 ? 'bg-emerald-50/40' : '') + '">' +
      '<td class="py-2 pr-4 font-mono text-slate-600">' + esc(r.waktu) + '</td>' +
      '<td class="py-2 pr-4 font-semibold text-slate-700">' + esc(r.device_id) + '</td>' +
      cell(num(r.soil), '%', soilStatus(num(r.soil))) +
      cell(num(r.kelembapan), '%', airStatus(num(r.kelembapan))) +
      cell(num(r.suhu), ' °C', tempStatus(num(r.suhu))) +
      '<td class="py-2">' + (fs.score == null ? '-' : '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ' + TONE[fs.grade.tone].badge + '"' + (fs.partial ? ' title="Partial: ' + fs.count + ' of 3 sensors"' : '') + '>' + fs.score + ' • ' + fs.grade.label + (fs.partial ? '*' : '') + '</span>') + '</td></tr>';
  }).join('');
}

// ---------- render: alerts ----------
function alertBox(kind, icon, title, body) {
  var c = { ok: ['bg-emerald-50', 'border-emerald-200/80', 'text-emerald-600', 'text-emerald-900', 'text-emerald-700'],
            info: ['bg-blue-50', 'border-blue-200/80', 'text-blue-600', 'text-blue-900', 'text-blue-700'],
            warn: ['bg-amber-50', 'border-amber-200/80', 'text-amber-600', 'text-amber-900', 'text-amber-700'],
            bad: ['bg-red-50', 'border-red-200/80', 'text-red-600', 'text-red-900', 'text-red-700'] }[kind];
  return '<div class="flex items-start gap-3 p-3 rounded-xl border ' + c[0] + ' ' + c[1] + '"><i class="fa-solid ' + icon + ' ' + c[2] + ' text-base mt-0.5"></i><div><div class="text-xs font-bold ' + c[3] + '">' + title + '</div><div class="text-[11px] mt-0.5 ' + c[4] + '">' + body + '</div></div></div>';
}

function renderAlerts(soil, air, temp, online, last, fs) {
  var out = [];
  if (state.error) out.push(alertBox('bad', 'fa-plug-circle-xmark', 'Server unreachable', 'The dashboard could not fetch data from the API. Retrying automatically.'));
  else if (!last) out.push(alertBox('info', 'fa-satellite-dish', 'Waiting for ESP32', 'No readings have reached /api/sensor yet.'));
  else if (!online) out.push(alertBox('warn', 'fa-wifi', 'Sensor not sending data', 'Last reading was ' + ageText(ageSeconds(last)) + '. Check the ESP32 power or WiFi connection.'));

  if (last) {
    if (!has(soil)) out.push(alertBox('info', 'fa-seedling', 'Soil sensor not reporting', 'Readings have no soil moisture. Set USE_SOIL_SENSOR to 1 and check the AOUT wire on GPIO 34.'));
    else if (soil < 20) out.push(alertBox('bad', 'fa-droplet-slash', 'Soil critically dry', 'Soil moisture ' + fmt(soil) + '%. Irrigate before planting.'));
    else if (soil < 40) out.push(alertBox('warn', 'fa-droplet', 'Soil dry', 'Soil moisture ' + fmt(soil) + '%. Recommendations shift toward drought-tolerant crops.'));
    else if (soil < 60) out.push(alertBox('warn', 'fa-droplet', 'Soil slightly dry', 'Soil moisture ' + fmt(soil) + '%. Plantable, but drought-tolerant crops will do best.'));
    else if (soil > 90) out.push(alertBox('info', 'fa-water', 'Soil saturated', 'Soil moisture ' + fmt(soil) + '%. Watch for root rot and standing water.'));
    else out.push(alertBox('ok', 'fa-seedling', 'Soil moisture adequate', 'Soil moisture ' + fmt(soil) + '% supports planting.'));

    if (has(temp)) {
      if (temp > 35) out.push(alertBox('bad', 'fa-fire', 'Heat wave', 'Temperature ' + fmt(temp) + ' &deg;C. Delay transplanting and add shade.'));
      else if (temp > 30) out.push(alertBox('warn', 'fa-sun', 'High temperature', 'Temperature ' + fmt(temp) + ' &deg;C. Favor heat-tolerant crops.'));
      else if (temp < 18) out.push(alertBox('info', 'fa-snowflake', 'Cool temperature', 'Temperature ' + fmt(temp) + ' &deg;C. Growth will be slower.'));
    }
    if (has(air)) {
      if (air > 85) out.push(alertBox('warn', 'fa-virus', 'Fungal disease risk', 'Air humidity ' + fmt(air) + '%. Improve spacing and air flow; avoid watering leaves.'));
      else if (air < 40) out.push(alertBox('warn', 'fa-wind', 'Dry air', 'Air humidity ' + fmt(air) + '%. Soil will dry faster; consider mulching.'));
    }
  }
  $('alerts').innerHTML = out.join('');
}

// ---------- render: parameters & plan ----------
function renderParams() {
  $('crop-grid').innerHTML = Object.keys(CROPS).filter(function (k) { return !CROPS[k].hanyaKandidat; }).map(function (k) {
    var c = CROPS[k], on = k === state.crop;
    return '<div onclick="selectCrop(\'' + k + '\')" class="cursor-pointer rounded-2xl p-4 flex flex-col items-center text-center transition ' + (on ? 'border-2 border-emerald-500 bg-emerald-50/70 shadow-sm' : 'border border-slate-200 bg-white hover:border-slate-300') + '">' +
      '<div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2.5 ' + (on ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500') + '"><i class="fa-solid ' + c.icon + '"></i></div>' +
      '<div class="font-extrabold text-xs ' + (on ? 'text-emerald-950' : 'text-slate-800') + '">' + c.nama + '</div>' +
      '<div class="text-[10px] font-medium mt-0.5 ' + (on ? 'text-emerald-700' : 'text-slate-400') + '">' + c.ket + '</div>' +
      '<span class="mt-2 text-[9px] ' + (on ? 'font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full' : 'font-semibold text-slate-400') + '">' + (on ? 'Selected' : 'Select') + '</span></div>';
  }).join('');

  $('prio-grid').innerHTML = PRIORITIES.map(function (p) {
    var on = state.pr[p.key];
    return '<div onclick="togglePriority(\'' + p.key + '\')" class="cursor-pointer rounded-2xl p-5 flex items-start gap-4 transition ' + (on ? 'border-2 border-blue-500 bg-blue-50/60 shadow-sm' : 'border border-slate-200 bg-white hover:border-slate-300') + '">' +
      '<div class="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ' + (on ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500') + '"><i class="fa-solid ' + p.icon + '"></i></div>' +
      '<div class="flex-grow"><div class="flex items-center justify-between gap-2"><h4 class="font-extrabold text-sm ' + (on ? 'text-blue-950' : 'text-slate-800') + '">' + p.title + '</h4>' +
      '<i class="' + (on ? 'fa-solid fa-circle-check text-blue-600' : 'fa-regular fa-circle text-slate-300') + ' text-lg"></i></div>' +
      '<p class="text-xs mt-1 ' + (on ? 'text-blue-800/80' : 'text-slate-500') + '">' + p.desc + '</p></div></div>';
  }).join('');
}

function renderRecommendation() {
  var cur = CROPS[state.crop];
  var plan = buildPlan();
  var first = CROPS[plan[0].key];
  var last = latest();
  var reg = REGIONS[state.region];
  var fs = fieldScore(last);
  var prioNames = PRIORITIES.filter(function (p) { return state.pr[p.key]; }).map(function (p) { return p.title; });

  $('rec-main').textContent = first.nama;
  $('rec-main-note').innerHTML = 'Rotates after <strong>' + cur.nama + '</strong> (' + cur.akar + ' roots, ' + cur.famili + ').';
  $('active-icon').className = 'fa-solid ' + cur.icon;
  $('active-name').textContent = cur.nama + ' (' + cur.latin + ')';
  $('active-ket').textContent = cur.ket;
  $('active-prio').textContent = prioNames.length ? prioNames.join(', ') : 'None';
  $('active-fam').textContent = cur.famili;
  $('active-next').textContent = first.nama + ' (' + first.akar + ' roots)';

  var readings = [];
  if (last && has(last.soil)) readings.push('soil moisture <strong>' + fmt(last.soil) + '%</strong>');
  if (last && has(last.kelembapan)) readings.push('air humidity <strong>' + fmt(last.kelembapan) + '%</strong>');
  if (last && has(last.suhu)) readings.push('temperature <strong>' + fmt(last.suhu) + ' &deg;C</strong>');
  $('rec-summary').innerHTML = 'Based on ' + (readings.length ? readings.join(', ') + ' (field score <strong>' + fs.score + ' &middot; ' + fs.grade.label + '</strong>)' : '<strong>no sensor data yet</strong> (crop history only)') +
    ' in <strong>' + reg.short + '</strong>, last crop <strong>' + cur.nama + '</strong>' + (prioNames.length ? ', priorities <strong>' + prioNames.join(', ') + '</strong>.' : '.');

  $('rec-metrics').innerHTML = [
    ['bg-blue-100 text-blue-600', 'fa-water', 'Stage 1 Water Need', AIR_LABEL[first.air]],
    ['bg-emerald-100 text-emerald-600', 'fa-bug-slash', 'Family Rotation', first.famili !== cur.famili ? 'Different family ✓' : 'Same family ✗'],
    ['bg-amber-100 text-amber-600', 'fa-layer-group', 'Root Depth Change', cur.akar + ' → ' + first.akar]
  ].map(function (m) {
    return '<div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5"><div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ' + m[0] + '"><i class="fa-solid ' + m[1] + '"></i></div><div><div class="text-xs text-slate-400 font-semibold">' + m[2] + '</div><div class="text-lg font-black text-slate-900 capitalize">' + m[3] + '</div></div></div>';
  }).join('');

  var styles = [
    { line: 'border-l-2 border-emerald-500 pb-6', dot: 'bg-emerald-500 ring-emerald-100', tag: 'text-emerald-800 bg-emerald-100', badge: 'text-emerald-600 bg-emerald-50 border-emerald-200', badgeText: 'Plant Next' },
    { line: 'border-l-2 border-dashed border-amber-400 pb-6', dot: 'bg-amber-400 ring-amber-100', tag: 'text-amber-800 bg-amber-100', badge: 'text-amber-700 bg-amber-50 border-amber-200', badgeText: 'Follow-up' },
    { line: '', dot: 'bg-slate-300 ring-slate-100', tag: 'text-slate-600 bg-slate-200', badge: 'text-slate-500 bg-slate-100 border-slate-200', badgeText: 'Cycle Restoration' }
  ];
  var startDay = 0;
  $('rec-timeline').innerHTML = plan.map(function (p, i) {
    var c = CROPS[p.key], st = styles[i];
    var when = i === 0 ? 'Start Now' : 'Start ~Day ' + startDay;
    startDay += c.hari[1];
    var alasan = p.alasan.length ? p.alasan : ['Best remaining option to keep the rotation diverse.'];
    return '<div class="relative pl-8 sm:pl-10 ' + st.line + '">' +
      '<div class="absolute -left-[11px] top-0 w-5 h-5 rounded-full ring-4 shadow ' + st.dot + '"></div>' +
      '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2"><div class="flex flex-wrap items-center gap-2">' +
      '<span class="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ' + st.tag + '">Stage ' + (i + 1) + ' • ' + when + '</span>' +
      '<span class="text-xs font-bold px-2 py-0.5 rounded-full border ' + st.badge + '">' + st.badgeText + '</span></div>' +
      '<span class="text-xs font-semibold text-slate-400">Duration: ' + c.hari[0] + ' - ' + c.hari[1] + ' Days</span></div>' +
      '<div class="bg-slate-50 border border-slate-200/90 rounded-2xl p-5">' +
      '<div class="flex items-center gap-3 mb-2"><h3 class="text-base font-extrabold text-slate-900">Plant ' + c.nama + ' (<i>' + c.latin + '</i>)</h3><span class="text-emerald-600"><i class="fa-solid ' + c.icon + '"></i></span></div>' +
      '<ul class="text-xs sm:text-sm text-slate-600 leading-relaxed list-disc pl-5 space-y-1">' + alasan.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul>' +
      '<div class="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200">' +
      '<span class="text-xs font-semibold text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-lg"><i class="fa-solid fa-droplet mr-1"></i>Water: ' + AIR_LABEL[c.air] + '</span>' +
      '<span class="text-xs font-semibold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-lg"><i class="fa-solid fa-seedling mr-1"></i>Roots: ' + c.akarCm + '</span>' +
      '<span class="text-xs font-semibold text-slate-700 bg-slate-200/80 px-2.5 py-1 rounded-lg">' + c.famili + '</span>' +
      (c.tahanKering ? '<span class="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg"><i class="fa-solid fa-sun mr-1"></i>Drought Tolerant</span>' : '') +
      (c.legum ? '<span class="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">Fixes Nitrogen</span>' : '') +
      '</div></div></div>';
  }).join('');
}

function renderLocation() {
  var r = REGIONS[state.region];
  $('map-label').textContent = 'Active Field: ' + r.short;
  $('map-coord').textContent = 'Lat: ' + r.lat.toFixed(3) + ' | Lon: ' + r.lon.toFixed(3);
}

function renderAll() { renderLive(); renderParams(); renderRecommendation(); renderLocation(); }

// ---------- interaction ----------
function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
  var target = $('tab-' + tabId); if (target) target.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(function (b) { b.classList.remove('border-emerald-600', 'text-emerald-700'); b.classList.add('border-transparent', 'text-slate-500'); });
  var btn = $('tab-btn-' + tabId); if (btn) { btn.classList.remove('border-transparent', 'text-slate-500'); btn.classList.add('border-emerald-600', 'text-emerald-700'); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function updateLocation(v) { state.region = v; savePrefs(); renderLocation(); renderRecommendation(); }
function selectCrop(k) { state.crop = k; savePrefs(); renderParams(); renderRecommendation(); }
function togglePriority(k) { state.pr[k] = !state.pr[k]; savePrefs(); renderParams(); renderRecommendation(); }

function savePrefs() { try { localStorage.setItem('terratech', JSON.stringify({ crop: state.crop, pr: state.pr, region: state.region })); } catch (e) {} }
function loadPrefs() {
  try {
    var p = JSON.parse(localStorage.getItem('terratech') || 'null');
    if (p) {
      if (CROPS[p.crop]) state.crop = p.crop;
      if (p.pr) state.pr = p.pr;
      if (REGIONS[p.region]) state.region = p.region;
    }
    var t = localStorage.getItem('terratech-trend');
    if (TRENDS[t]) state.trend = t;
  } catch (e) {}
  $('region-select').value = state.region;
}

// ---------- data ----------
function loadLogs() {
  return fetch(API, { cache: 'no-store' })
    .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(function (data) {
      state.error = false;
      var prevTop = state.logs.length ? state.logs[0].id : null;
      state.logs = Array.isArray(data) ? data : [];
      var newTop = state.logs.length ? state.logs[0].id : null;
      renderLive();
      if (prevTop !== newTop) renderRecommendation();
    })
    .catch(function () { state.error = true; renderLive(); });
}

function manualSync() {
  var icon = $('sync-icon');
  icon.classList.add('fa-spin');
  loadLogs().then(function () { setTimeout(function () { icon.classList.remove('fa-spin'); }, 400); });
}

loadPrefs();
renderAll();
loadLogs();
setInterval(loadLogs, POLL_MS);
setInterval(renderLive, 10000);
window.addEventListener('resize', renderTrend);
</script>
</body>
</html>`;
