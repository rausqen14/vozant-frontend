
import { CarFeatures, Language } from "../types";
import { API_BASE_URL } from "./api";

type CacheEntry = {
  value: string;
  timestamp: number;
};

const CAR_INFO_CACHE_KEY = 'vozant-car-info-cache-v1';
const CAR_INFO_CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const carInfoMemoryCache = new Map<string, CacheEntry>();
let carInfoLocalCache: Record<string, CacheEntry> | null = null;

const loadCarInfoLocalCache = () => {
  if (carInfoLocalCache) {
    return;
  }
  if (typeof window === 'undefined') {
    carInfoLocalCache = {};
    return;
  }
  try {
    const raw = window.localStorage.getItem(CAR_INFO_CACHE_KEY);
    carInfoLocalCache = raw ? JSON.parse(raw) : {};
  } catch {
    carInfoLocalCache = {};
  }
};

const readCarInfoCache = (key: string) => {
  const now = Date.now();
  const memoryEntry = carInfoMemoryCache.get(key);
  if (memoryEntry && now - memoryEntry.timestamp < CAR_INFO_CACHE_TTL_MS) {
    return memoryEntry.value;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  loadCarInfoLocalCache();
  const localEntry = carInfoLocalCache?.[key];
  if (localEntry && now - localEntry.timestamp < CAR_INFO_CACHE_TTL_MS) {
    carInfoMemoryCache.set(key, localEntry);
    return localEntry.value;
  }
  return null;
};

const writeCarInfoCache = (key: string, value: string) => {
  const entry = { value, timestamp: Date.now() };
  carInfoMemoryCache.set(key, entry);
  if (typeof window === 'undefined') {
    return;
  }
  loadCarInfoLocalCache();
  if (!carInfoLocalCache) {
    carInfoLocalCache = {};
  }
  carInfoLocalCache[key] = entry;
  try {
    window.localStorage.setItem(CAR_INFO_CACHE_KEY, JSON.stringify(carInfoLocalCache));
  } catch {
  }
};

const buildCarInfoCacheKey = (features: CarFeatures, lang: Language) => {
  const parts = [
    lang,
    features.brand,
    features.model,
    features.year
  ];
  return parts.map(value => String(value).trim().toLowerCase()).join('|');
};

export const getCarInfoCard = async (
  features: CarFeatures,
  lang: Language = 'EN'
): Promise<string> => {
  const cacheKey = buildCarInfoCacheKey(features, lang);
  const cached = readCarInfoCache(cacheKey);
  if (cached !== null) {
    return cached;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/car-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand: features.brand,
        model: features.model,
        year: features.year,
        language: lang
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Car info failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    const text = String(data?.text || '').trim();
    if (text) {
      writeCarInfoCache(cacheKey, text);
    }
    return text;
  } catch (error) {
    console.error("Gemini car info error:", error);
    return '';
  }
};

