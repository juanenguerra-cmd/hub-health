const KEY = 'NES_TELEMETRY_V1';

export interface TelemetryCounters {
  findingToQaClicks: number;
  bundleGeneratedCases: number;
  findingToClosureDays: number[];
  overdueSnapshots: number[];
}

const DEFAULTS: TelemetryCounters = {
  findingToQaClicks: 0,
  bundleGeneratedCases: 0,
  findingToClosureDays: [],
  overdueSnapshots: [],
};

function load(): TelemetryCounters {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(data: TelemetryCounters) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function trackBundleGenerated() {
  const data = load();
  data.findingToQaClicks += 1;
  data.bundleGeneratedCases += 1;
  save(data);
}
