import { CarFeatures } from "../types";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "https://api.vozant.com";


export interface PredictApiResponse {
  estimatedPrice: number;
  confidenceScore?: number;
  raw?: {
    cb_log: number;
    lgb_log: number;
    xgb_log: number;
  };
}

export interface OptionsResponse {
  brands: string[];
  models: Record<string, string[]>;
  years: Record<string, Record<string, number[]>>;
  attrs: Record<
    string,
    Record<
      string,
      {
        fuel_type: string[];
        transmission: string[];
        engine_type: string[];
        engine_displacement: number[];
        horsepower: number[];
        torque: number[];
      }
    >
  >;
  engine_displacement_map?: Record<string, Record<string, Record<string, number[]>>>;
}

export async function predictPrice(features: CarFeatures): Promise<PredictApiResponse> {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Prediction failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function getOptions(): Promise<OptionsResponse> {
  const res = await fetch(`${API_BASE_URL}/options`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Options fetch failed (${res.status}): ${text}`);
  }
  return res.json();
}

export interface GenerateImagesResponse {
  images: string[];
  cached?: boolean;
}

export async function generateCarImages(payload: { brand: string; model: string; year: number }): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/generate-images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image generation failed (${res.status}): ${text}`);
  }
  const data: GenerateImagesResponse = await res.json();
  return data.images || [];
}
