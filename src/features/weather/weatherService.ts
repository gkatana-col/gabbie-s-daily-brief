import type { ResolvedLanguage, WeatherData } from "@/features/briefing/types";
import { nativeBridge } from "@/features/native/nativeBridge";

/** Live weather: device location (standard browser/Android permission flow) → Open-Meteo (free, no key). No mock fallback. */
export type WeatherStatus = "idle" | "loading" | "ok" | "permission_denied" | "unavailable";
export interface WeatherReading { temperature: number; feelsLike: number; high: number; low: number; code: number; unit: "C" | "F"; location: string; precipitationChance?: number; fetchedAt: number }
export interface WeatherState { status: WeatherStatus; reading: WeatherReading | null }

const STALE_MS = 10 * 60_000;
let state: WeatherState = { status: "idle", reading: null };
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;

const set = (next: WeatherState) => { state = next; listeners.forEach((l) => l()); };
export const getWeatherState = () => state;
export const subscribeWeather = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** Fahrenheit only for locales that use it (US and a few territories); Celsius everywhere else. */
export function unitForLocale(locale: string): "C" | "F" {
  const region = locale.split(/[-_]/)[1]?.toUpperCase();
  return region && ["US", "LR", "MM", "BS", "BZ", "KY", "PW", "FM", "MH"].includes(region) ? "F" : "C";
}

const conditions: Record<string, [string, string]> = {
  clear: ["Ясно", "Clear"], mostlyClear: ["Предимно ясно", "Mostly clear"], partly: ["Частично облачно", "Partly cloudy"], overcast: ["Облачно", "Overcast"],
  fog: ["Мъгла", "Fog"], drizzle: ["Ръмеж", "Drizzle"], rain: ["Дъжд", "Rain"], snow: ["Сняг", "Snow"], showers: ["Превалявания", "Showers"], storm: ["Гръмотевична буря", "Thunderstorm"],
};
/** WMO weather code → localized condition. */
export function conditionFor(code: number, language: ResolvedLanguage): string {
  const key = code === 0 ? "clear" : code === 1 ? "mostlyClear" : code === 2 ? "partly" : code === 3 ? "overcast" : code <= 48 ? "fog" : code <= 57 ? "drizzle" : code <= 67 ? "rain" : code <= 77 ? "snow" : code <= 82 ? "showers" : code <= 86 ? "snow" : "storm";
  const pair = conditions[key] ?? conditions["overcast"]!;
  return language === "bg" ? pair[0] : pair[1];
}

export function toWeatherData(reading: WeatherReading, language: ResolvedLanguage): WeatherData {
  return { temperature: reading.temperature, feelsLike: reading.feelsLike, high: reading.high, low: reading.low, condition: conditionFor(reading.code, language), location: reading.location, unit: reading.unit, ...(reading.precipitationChance !== undefined ? { precipitationChance: reading.precipitationChance } : {}) };
}

const getPosition = async (): Promise<{ latitude: number; longitude: number }> => {
  if (nativeBridge.isNativeApp()) return nativeBridge.getCurrentLocation();
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return reject({ code: 2 });
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      reject,
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 5 * 60_000 },
    );
  });
};

async function fetchReading(lat: number, lon: number, unit: "C" | "F", language: ResolvedLanguage): Promise<WeatherReading> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(3), longitude: lon.toFixed(3), timezone: "auto", forecast_days: "1",
    current: "temperature_2m,apparent_temperature,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    ...(unit === "F" ? { temperature_unit: "fahrenheit" } : {}),
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const j = await res.json();
  let location = "";
  try {
    const g = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${language}`);
    if (g.ok) { const gj = await g.json(); location = gj.city || gj.locality || gj.principalSubdivision || ""; }
  } catch { /* location name is optional */ }
  const r = Math.round;
  const precip = j.daily?.precipitation_probability_max?.[0];
  return {
    temperature: r(j.current.temperature_2m), feelsLike: r(j.current.apparent_temperature), code: j.current.weather_code,
    high: r(j.daily.temperature_2m_max[0]), low: r(j.daily.temperature_2m_min[0]), unit, location,
    ...(typeof precip === "number" ? { precipitationChance: precip } : {}), fetchedAt: Date.now(),
  };
}

/** Refreshes weather unless a fresh reading exists (force ignores freshness). Never throws. */
export function refreshWeather(language: ResolvedLanguage, force = false): Promise<void> {
  if (inflight) return inflight;
  if (!force && state.status === "ok" && state.reading && Date.now() - state.reading.fetchedAt < STALE_MS) return Promise.resolve();
  set({ status: "loading", reading: null }); // never show stale data while refreshing
  inflight = (async () => {
    try {
      const pos = await getPosition();
      const unit = unitForLocale(nativeBridge.getDeviceLocale());
      set({ status: "ok", reading: await fetchReading(pos.latitude, pos.longitude, unit, language) });
    } catch (e) {
      set({ status: (e as { code?: number })?.code === 1 ? "permission_denied" : "unavailable", reading: null });
    } finally { inflight = null; }
  })();
  return inflight;
}
