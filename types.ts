
export interface CarFeatures {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  engineType: string;
  engineDisplacement: number; // cubic centimeters
  horsepower: number;
  torque: number;
  isNew: boolean;
}

export interface PredictionResult {
  estimatedPrice: number;
  marketAnalysis: string;
  confidenceScore: number;
  raw?: {
    cb_log: number;
    lgb_log: number;
    xgb_log: number;
  };
}

export type Page = 'landing' | 'prediction';
export type Language = 'EN' | 'TR';
