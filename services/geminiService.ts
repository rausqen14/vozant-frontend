
import { GoogleGenAI } from "@google/genai";
import { CarFeatures, Language } from "../types";
import { API_BASE_URL } from "./api";

const apiKey =
  (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ||
  (import.meta.env.VITE_API_KEY as string | undefined) ||
  '';
const ai = new GoogleGenAI({ apiKey });

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

export const getMarketAnalysis = async (features: CarFeatures, predictedPrice: number, lang: Language = 'EN'): Promise<string> => {
  try {
    const isTR = lang === 'TR';
    const prompt = isTR 
      ? `Seçkin bir otomotiv pazar analisti olarak, ${features.year} model ${features.brand} ${features.model} (${features.mileage}km) için kısa ve zarif 3 cümlelik bir özet hazırla. 
         Tahmini piyasa değeri $${predictedPrice.toLocaleString()}. 
         Aracın değer koruma durumunu ve lüks pazarındaki güncel arzu edilebilirliğini tartış. 
         Tonun sofistike, profesyonel ve öz olsun.`
      : `As an elite automotive market analyst, provide a brief, elegant 3-sentence summary for a ${features.year} ${features.brand} ${features.model} with ${features.mileage}km. 
         The estimated market value is $${predictedPrice.toLocaleString()}. 
         Discuss its value retention and current luxury market desirability. 
         Keep the tone sophisticated, professional, and concise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    });

    const text = response.text?.trim() || '';
    return text;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return '';
  }
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

